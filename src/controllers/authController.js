import jwt from 'jsonwebtoken';
import { asyncHandler } from '../middleware/errorHandler.js';
import { User } from '../models/User.js';
import { ErrorTypes } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'hattbooks-dev-secret',
    { expiresIn: '15m' }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'hattbooks-refresh-secret',
    { expiresIn: '7d' }
  );
};

const generateTokenPair = async (user, req) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await user.addRefreshToken(
    refreshToken,
    req.ip || req.connection.remoteAddress,
    req.get('user-agent')
  );

  return { accessToken, refreshToken };
};

export const registerLocal = asyncHandler(async (req, res) => {
  const { email, username, displayName, password, avatar } = req.body;

  if (!email || !username || !displayName || !password) {
    throw ErrorTypes.BAD_REQUEST('Missing required fields', {
      required: ['email', 'username', 'displayName', 'password'],
    });
  }

  if (password.length < 8) {
    throw ErrorTypes.BAD_REQUEST('Password must be at least 8 characters long');
  }

  const existingUser = await User.findOne({
    $or: [
      { email: email.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  });

  if (existingUser) {
    if (existingUser.email === email.toLowerCase()) {
      throw ErrorTypes.CONFLICT('Email already in use');
    }
    if (existingUser.username === username.toLowerCase()) {
      throw ErrorTypes.CONFLICT('Username already taken');
    }
  }

  const user = await User.create({
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    displayName,
    password,
    avatar: avatar || null,
    authProvider: 'local',
  });

  const { accessToken, refreshToken } = await generateTokenPair(user, req);

  res.status(201).json(
    ApiResponse.success({
      user: user.toPublicProfile(),
      accessToken,
      refreshToken,
      message: '¡Bienvenido a HattBooks! Tu cuenta ha sido creada exitosamente.',
    })
  );
});

export const loginLocal = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw ErrorTypes.BAD_REQUEST('Email and password are required');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw ErrorTypes.UNAUTHORIZED('Invalid email or password');
  }

  if (user.authProvider !== 'local') {
    throw ErrorTypes.BAD_REQUEST(
      `This account uses ${user.authProvider} login. Please use the "${user.authProvider}" button to sign in.`
    );
  }

  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    throw ErrorTypes.UNAUTHORIZED('Invalid email or password');
  }

  await user.updateLastLogin();

  const { accessToken, refreshToken } = await generateTokenPair(user, req);

  res.json(
    ApiResponse.success({
      user: user.toPublicProfile(),
      accessToken,
      refreshToken,
      message: `¡Bienvenido de vuelta, ${user.displayName}!`,
    })
  );
});

export const register = asyncHandler(async (req, res) => {
  const { auth0Id, email, username, displayName, avatar, provider } = req.body;

  if (!auth0Id || !email || !username || !displayName) {
    throw ErrorTypes.BAD_REQUEST('Missing required fields', {
      required: ['auth0Id', 'email', 'username', 'displayName'],
    });
  }

  const existingUser = await User.findOne({
    $or: [
      { auth0Id },
      { email: email.toLowerCase() },
      { username: username.toLowerCase() },
    ],
  });

  if (existingUser) {
    if (existingUser.auth0Id === auth0Id) {
      throw ErrorTypes.CONFLICT('User already registered');
    }
    if (existingUser.email === email.toLowerCase()) {
      throw ErrorTypes.CONFLICT('Email already in use');
    }
    if (existingUser.username === username.toLowerCase()) {
      throw ErrorTypes.CONFLICT('Username already taken');
    }
  }

  const user = await User.create({
    auth0Id,
    email: email.toLowerCase(),
    username: username.toLowerCase(),
    displayName,
    avatar: avatar || null,
    authProvider: provider || 'auth0',
  });

  res.status(201).json(
    ApiResponse.success(
      {
        user: user.toPublicProfile(),
        message: '¡Bienvenido a HattBooks! Tu cuenta ha sido creada exitosamente.',
      },
      null
    )
  );
});

export const login = asyncHandler(async (req, res) => {
  const { auth0Id } = req.body;

  if (!auth0Id) {
    throw ErrorTypes.BAD_REQUEST('Auth0 ID is required');
  }

  const user = await User.findByAuth0Id(auth0Id);

  if (!user) {
    throw ErrorTypes.NOT_FOUND('User not found. Please register first.');
  }

  if (!user.isActive) {
    throw ErrorTypes.FORBIDDEN('Account is deactivated');
  }

  await user.updateLastLogin();

  res.json(
    ApiResponse.success({
      user: user.toPublicProfile(),
      message: `¡Bienvenido de vuelta, ${user.displayName}!`,
    })
  );
});

export const logout = asyncHandler(async (req, res) => {
  res.json(
    ApiResponse.success({
      message: 'Logged out successfully',
    })
  );
});

export const getMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('User not authenticated');
  }

  const user = await User.findById(req.user._id)
    .select('-__v')
    .lean();

  res.json(
    ApiResponse.success({
      user: {
        ...user,
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
      },
    })
  );
});

export const updateMe = asyncHandler(async (req, res) => {
  const { displayName, bio, avatar, preferences } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ErrorTypes.NOT_FOUND('User not found');
  }

  if (displayName) user.displayName = displayName;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (preferences) {
    user.preferences = {
      ...user.preferences,
      ...preferences,
    };
  }

  await user.save();

  res.json(
    ApiResponse.success({
      user: user.toPublicProfile(),
      message: 'Profile updated successfully',
    })
  );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ErrorTypes.BAD_REQUEST('Refresh token is required');
  }

  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET || 'hattbooks-refresh-secret'
    );

    if (decoded.type !== 'refresh') {
      throw ErrorTypes.UNAUTHORIZED('Invalid token type');
    }

    const user = await User.findById(decoded.userId);

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found');
    }

    if (!user.isActive) {
      throw ErrorTypes.FORBIDDEN('Account is deactivated');
    }

    const isValidToken = user.validateRefreshToken(refreshToken);

    if (!isValidToken) {
      throw ErrorTypes.UNAUTHORIZED('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken(user._id);

    res.json(
      ApiResponse.success({
        accessToken: newAccessToken,
        message: 'Access token refreshed successfully',
      })
    );
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw ErrorTypes.UNAUTHORIZED('Invalid or expired refresh token');
    }
    throw error;
  }
});


export const revokeRefreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    throw ErrorTypes.BAD_REQUEST('Refresh token is required');
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    throw ErrorTypes.NOT_FOUND('User not found');
  }

  await user.removeRefreshToken(refreshToken);

  res.json(
    ApiResponse.success({
      message: 'Refresh token revoked successfully',
    })
  );
});

export const revokeAllRefreshTokens = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    throw ErrorTypes.NOT_FOUND('User not found');
  }

  await user.clearAllRefreshTokens();

  res.json(
    ApiResponse.success({
      message: 'All refresh tokens revoked successfully. You have been logged out from all devices.',
    })
  );
});
