import { body } from 'express-validator';
import { validate } from '../middleware/validator.js';

export const registerLocalValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('displayName')
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ max: 100 })
    .withMessage('Display name must be less than 100 characters'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  validate,
];

export const loginLocalValidators = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

export const registerSocialValidators = [
  body('auth0Id').notEmpty().withMessage('Auth0 ID is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('displayName')
    .notEmpty()
    .withMessage('Display name is required')
    .isLength({ max: 100 })
    .withMessage('Display name must be less than 100 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  validate,
];

export const loginSocialValidators = [
  body('auth0Id').notEmpty().withMessage('Auth0 ID is required'),
  validate,
];

export const updateProfileValidators = [
  body('displayName')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Display name must be less than 100 characters'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('avatar').optional().isURL().withMessage('Avatar must be a valid URL'),
  validate,
];

export const refreshTokenValidators = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate,
];

export const revokeTokenValidators = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate,
];
