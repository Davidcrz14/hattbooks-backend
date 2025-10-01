import { expressjwt } from 'express-jwt';
import jwksRsa from 'jwks-rsa';
import { config } from '../config/index.js';
import { ErrorTypes } from '../utils/ApiError.js';

export const authMiddleware = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${config.auth0.issuer}.well-known/jwks.json`,
  }),

  audience: config.auth0.audience,
  issuer: config.auth0.issuer,
  algorithms: ['RS256'],

  requestProperty: 'auth',
});

export const attachUser = async (req, res, next) => {
  try {
    if (!req.auth || !req.auth.sub) {
      throw ErrorTypes.UNAUTHORIZED('No user information in token');
    }

    const { User } = await import('../models/User.js');

    const user = await User.findOne({ auth0Id: req.auth.sub });

    if (!user) {
      throw ErrorTypes.NOT_FOUND('User not found in database');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export const optionalAuth = expressjwt({
  secret: jwksRsa.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `${config.auth0.issuer}.well-known/jwks.json`,
  }),
  audience: config.auth0.audience,
  issuer: config.auth0.issuer,
  algorithms: ['RS256'],
  requestProperty: 'auth',
  credentialsRequired: false,
});
