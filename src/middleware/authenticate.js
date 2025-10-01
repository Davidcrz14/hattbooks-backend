import jwt from 'jsonwebtoken';
import jwksRsa from 'jwks-rsa';
import { config } from '../config/index.js';
import { User } from '../models/User.js';
import { ErrorTypes } from '../utils/ApiError.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ErrorTypes.UNAUTHORIZED('No token provided');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hatter-by-like-uwu');

      if (decoded.type === 'refresh') {
        throw ErrorTypes.UNAUTHORIZED('Refresh tokens cannot be used for authentication. Use /auth/refresh endpoint.');
      }

      const user = await User.findById(decoded.userId);

      if (!user) {
        throw ErrorTypes.NOT_FOUND('User not found');
      }

      if (!user.isActive) {
        throw ErrorTypes.FORBIDDEN('Account is deactivated');
      }

      req.user = user;
      req.authType = 'local';
      return next();
    } catch (localJwtError) {
      if (!config.auth0.domain || !config.auth0.audience) {
        throw ErrorTypes.UNAUTHORIZED('Invalid token');
      }

      try {
        const client = jwksRsa({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${config.auth0.issuer}.well-known/jwks.json`,
        });

        const getKey = (header, callback) => {
          client.getSigningKey(header.kid, (err, key) => {
            if (err) {
              return callback(err);
            }
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
          });
        };

        const auth0Decoded = await new Promise((resolve, reject) => {
          jwt.verify(
            token,
            getKey,
            {
              audience: config.auth0.audience,
              issuer: config.auth0.issuer,
              algorithms: ['RS256'],
            },
            (err, decoded) => {
              if (err) return reject(err);
              resolve(decoded);
            }
          );
        });

        const user = await User.findOne({ auth0Id: auth0Decoded.sub });

        if (!user) {
          throw ErrorTypes.NOT_FOUND('User not found in database. Please register first.');
        }

        if (!user.isActive) {
          throw ErrorTypes.FORBIDDEN('Account is deactivated');
        }

        req.user = user;
        req.authType = 'auth0';
        req.auth = auth0Decoded;
        return next();
      } catch (auth0Error) {
        throw ErrorTypes.UNAUTHORIZED('Invalid or expired token');
      }
    }
  } catch (error) {
    next(error);
  }
};

export const optionalAuthenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hattbooks-dev-secret');
      const user = await User.findById(decoded.userId);

      if (user && user.isActive) {
        req.user = user;
        req.authType = 'local';
        return next();
      }
    } catch (localError) {
    }

    if (config.auth0.domain && config.auth0.audience) {
      try {
        const client = jwksRsa({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `${config.auth0.issuer}.well-known/jwks.json`,
        });

        const getKey = (header, callback) => {
          client.getSigningKey(header.kid, (err, key) => {
            if (err) return callback(err);
            const signingKey = key.getPublicKey();
            callback(null, signingKey);
          });
        };

        const auth0Decoded = await new Promise((resolve, reject) => {
          jwt.verify(
            token,
            getKey,
            {
              audience: config.auth0.audience,
              issuer: config.auth0.issuer,
              algorithms: ['RS256'],
            },
            (err, decoded) => {
              if (err) return reject(err);
              resolve(decoded);
            }
          );
        });

        const user = await User.findOne({ auth0Id: auth0Decoded.sub });
        if (user && user.isActive) {
          req.user = user;
          req.authType = 'auth0';
          req.auth = auth0Decoded;
        }
      } catch (auth0Error) {
      }
    }

    next();
  } catch (error) {
    next();
  }
};
