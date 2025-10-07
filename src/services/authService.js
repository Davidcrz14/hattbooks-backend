import jwt from 'jsonwebtoken';
import { userRepository } from '../repositories/userRepository.js';
import { ErrorTypes } from '../utils/ApiError.js';

const generateAccessToken = (userId) =>
  jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET || 'hattbooks-dev-secret',
    { expiresIn: '15m' }
  );

const generateRefreshToken = (userId) =>
  jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'hattbooks-refresh-secret',
    { expiresIn: '7d' }
  );

const generateTokenPair = async (user, { ipAddress, userAgent }) => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  await user.addRefreshToken(refreshToken, ipAddress, userAgent);

  return { accessToken, refreshToken };
};

export const authService = {
  async registerLocal(payload, context) {
    const { email, username, displayName, password, avatar } = payload;

    if (!email || !username || !displayName || !password) {
      throw ErrorTypes.BAD_REQUEST('Missing required fields', {
        required: ['email', 'username', 'displayName', 'password'],
      });
    }

    if (password.length < 8) {
      throw ErrorTypes.BAD_REQUEST('Password must be at least 8 characters long');
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const existingUser = await userRepository.findByEmailOrUsername(
      normalizedEmail,
      normalizedUsername
    );

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        throw ErrorTypes.CONFLICT('Email already in use');
      }
      if (existingUser.username === normalizedUsername) {
        throw ErrorTypes.CONFLICT('Username already taken');
      }
    }

    const user = await userRepository.create({
      email: normalizedEmail,
      username: normalizedUsername,
      displayName,
      password,
      avatar: avatar || null,
      authProvider: 'local',
    });

    const tokens = await generateTokenPair(user, context);

    return {
      user: user.toPublicProfile(),
      ...tokens,
      message: '¡Bienvenido a HattBooks! Tu cuenta ha sido creada exitosamente.',
    };
  },

  async loginLocal(payload, context) {
    const { email, password } = payload;

    if (!email || !password) {
      throw ErrorTypes.BAD_REQUEST('Email and password are required');
    }

  const user = await userRepository.findByEmailWithPassword(email);

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
    const tokens = await generateTokenPair(user, context);

    return {
      user: user.toPublicProfile(),
      ...tokens,
      message: `¡Bienvenido de vuelta, ${user.displayName}!`,
    };
  },

  async registerSocial(payload) {
    const { auth0Id, email, username, displayName, avatar, provider } = payload;

    if (!auth0Id || !email || !username || !displayName) {
      throw ErrorTypes.BAD_REQUEST('Missing required fields', {
        required: ['auth0Id', 'email', 'username', 'displayName'],
      });
    }

    const normalizedEmail = email.toLowerCase();
    const normalizedUsername = username.toLowerCase();

    const existingUser = await userRepository.findByAuth0EmailOrUsername(
      auth0Id,
      normalizedEmail,
      normalizedUsername
    );

    if (existingUser) {
      if (existingUser.auth0Id === auth0Id) {
        throw ErrorTypes.CONFLICT('User already registered');
      }
      if (existingUser.email === normalizedEmail) {
        throw ErrorTypes.CONFLICT('Email already in use');
      }
      if (existingUser.username === normalizedUsername) {
        throw ErrorTypes.CONFLICT('Username already taken');
      }
    }

    const user = await userRepository.create({
      auth0Id,
      email: normalizedEmail,
      username: normalizedUsername,
      displayName,
      avatar: avatar || null,
      authProvider: provider || 'auth0',
    });

    return {
      user: user.toPublicProfile(),
      message: '¡Bienvenido a HattBooks! Tu cuenta ha sido creada exitosamente.',
    };
  },

  async loginSocial(payload) {
    const { auth0Id } = payload;

    if (!auth0Id) {
      throw ErrorTypes.BAD_REQUEST('Auth0 ID is required');
    }

  const user = await userRepository.findByAuth0Id(auth0Id);

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found. Please register first.');
    }

    if (!user.isActive) {
      throw ErrorTypes.FORBIDDEN('Account is deactivated');
    }

    await user.updateLastLogin();

    return {
      user: user.toPublicProfile(),
      message: `¡Bienvenido de vuelta, ${user.displayName}!`,
    };
  },

  async getProfile(userId) {
  const user = await userRepository.findByIdLean(userId);

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found');
    }

    return {
      ...user,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    };
  },

  async updateProfile(userId, updates) {
    const { displayName, bio, avatar, preferences } = updates;
  const user = await userRepository.findById(userId);

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

    return {
      user: user.toPublicProfile(),
      message: 'Profile updated successfully',
    };
  },

  async refreshAccessToken(refreshToken) {
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

  const user = await userRepository.findById(decoded.userId);

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

      return {
        accessToken: newAccessToken,
        message: 'Access token refreshed successfully',
      };
    } catch (error) {
      if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
        throw ErrorTypes.UNAUTHORIZED('Invalid or expired refresh token');
      }
      throw error;
    }
  },

  async revokeRefreshToken(userId, refreshToken) {
    if (!refreshToken) {
      throw ErrorTypes.BAD_REQUEST('Refresh token is required');
    }

  const user = await userRepository.findById(userId);

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found');
    }

    await user.removeRefreshToken(refreshToken);

    return {
      message: 'Refresh token revoked successfully',
    };
  },

  async revokeAllRefreshTokens(userId) {
  const user = await userRepository.findById(userId);

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found');
    }

    await user.clearAllRefreshTokens();

    return {
      message: 'All refresh tokens revoked successfully. You have been logged out from all devices.',
    };
  },
};
