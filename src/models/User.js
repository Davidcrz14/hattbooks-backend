import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    auth0Id: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: function() {
        return !this.auth0Id;
      },
      select: false,
    },

    authProvider: {
      type: String,
      enum: ['local', 'auth0', 'google', 'facebook'],
      default: 'local',
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      index: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    bio: {
      type: String,
      maxlength: 500,
      default: '',
    },

    karma: {
      type: Number,
      default: 0,
      min: 0,
    },
    reputation: {
      type: Number,
      default: 0,
      min: 0,
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
    },

    readingStats: {
      booksRead: {
        type: Number,
        default: 0,
      },
      pagesRead: {
        type: Number,
        default: 0,
      },
      currentStreak: {
        type: Number,
        default: 0,
      },
      longestStreak: {
        type: Number,
        default: 0,
      },
      lastReadingDate: {
        type: Date,
        default: null,
      },
    },

    preferences: {
      isPrivate: {
        type: Boolean,
        default: false,
      },
      showReadingGoals: {
        type: Boolean,
        default: true,
      },
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'auto',
      },
      language: {
        type: String,
        default: 'es',
      },
    },

    followers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],

    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },

    refreshTokens: [{
      token: {
        type: String,
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      expiresAt: {
        type: Date,
        required: true,
      },
      ipAddress: String,
      userAgent: String,
    }],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

userSchema.index({ createdAt: -1 });

userSchema.virtual('followersCount').get(function () {
  return this.followers.length;
});

userSchema.virtual('followingCount').get(function () {
  return this.following.length;
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  if (this.password) {
    const bcrypt = await import('bcrypt');
    this.password = await bcrypt.default.hash(this.password, 12);
  }

  next();
});

userSchema.methods.toPublicProfile = function () {
  return {
    _id: this._id,
    username: this.username,
    displayName: this.displayName,
    avatar: this.avatar,
    bio: this.bio,
    karma: this.karma,
    reputation: this.reputation,
    level: this.level,
    authProvider: this.authProvider,
    readingStats: this.readingStats,
    followersCount: this.followersCount,
    followingCount: this.followingCount,
    createdAt: this.createdAt,
  };
};

userSchema.methods.toJSON = function () {
  const obj = this.toObject();

  delete obj.password;
  delete obj.refreshTokens;
  delete obj.__v;

  return obj;
};

userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  const bcrypt = await import('bcrypt');
  return await bcrypt.default.compare(candidatePassword, this.password);
};

userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

userSchema.methods.incrementKarma = function (points = 1) {
  this.karma += points;
  return this.save();
};

userSchema.methods.updateReadingStreak = function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastReading = this.readingStats.lastReadingDate
    ? new Date(this.readingStats.lastReadingDate)
    : null;

  if (lastReading) {
    lastReading.setHours(0, 0, 0, 0);
    const daysDiff = Math.floor((today - lastReading) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      this.readingStats.currentStreak += 1;
    } else if (daysDiff > 1) {
      this.readingStats.currentStreak = 1;
    }
  } else {
    this.readingStats.currentStreak = 1;
  }

  if (this.readingStats.currentStreak > this.readingStats.longestStreak) {
    this.readingStats.longestStreak = this.readingStats.currentStreak;
  }

  this.readingStats.lastReadingDate = today;
  return this.save();
};

userSchema.methods.addRefreshToken = async function (token, ipAddress, userAgent) {
  const crypto = await import('crypto');
  const hashedToken = crypto.default.createHash('sha256').update(token).digest('hex');

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );

  if (this.refreshTokens.length >= 5) {
    this.refreshTokens.shift();
  }

  this.refreshTokens.push({
    token: hashedToken,
    expiresAt,
    ipAddress,
    userAgent,
  });

  return this.save();
};

userSchema.methods.validateRefreshToken = function (token) {
  const crypto = require('crypto');
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  const validToken = this.refreshTokens.find(
    (rt) => rt.token === hashedToken && rt.expiresAt > new Date()
  );

  return !!validToken;
};

userSchema.methods.removeRefreshToken = async function (token) {
  const crypto = await import('crypto');
  const hashedToken = crypto.default.createHash('sha256').update(token).digest('hex');

  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.token !== hashedToken
  );

  return this.save();
};

userSchema.methods.clearAllRefreshTokens = async function () {
  this.refreshTokens = [];
  return this.save();
};

userSchema.statics.findByAuth0Id = function (auth0Id) {
  return this.findOne({ auth0Id });
};

userSchema.statics.findByUsername = function (username) {
  return this.findOne({ username: username.toLowerCase() });
};

userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

export const User = mongoose.model('User', userSchema);
