import express from 'express';
import { body } from 'express-validator';
import {
    getMe,
    login,
    loginLocal,
    logout,
    refreshAccessToken,
    register,
    registerLocal,
    revokeAllRefreshTokens,
    revokeRefreshToken,
    updateMe,
} from '../controllers/authController.js';
import { authenticate } from '../middleware/authenticate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validator.js';

const router = express.Router();

/**
 * @openapi
 * /api/auth/register-local:
 *   post:
 *     summary: Register with email and password
 *     description: Creates a new user account with traditional email/password authentication
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - displayName
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *                 example: johndoe
 *               displayName:
 *                 type: string
 *                 example: John Doe
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: SecurePassword123!
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post(
  '/register-local',
  authLimiter,
  [
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
  ],
  registerLocal
);

/**
 * @openapi
 * /api/auth/login-local:
 *   post:
 *     summary: Login with email and password
 *     description: Authenticates user with traditional email/password
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: SecurePassword123!
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post(
  '/login-local',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
  ],
  loginLocal
);

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     summary: Register with social provider (Auth0)
 *     description: Creates a new user account after Auth0 social authentication (Google, Facebook, etc.)
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth0Id
 *               - email
 *               - username
 *               - displayName
 *             properties:
 *               auth0Id:
 *                 type: string
 *                 description: Auth0 user ID (sub claim)
 *               email:
 *                 type: string
 *                 format: email
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               displayName:
 *                 type: string
 *               avatar:
 *                 type: string
 *                 format: uri
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 *       409:
 *         description: User already exists
 */
router.post(
  '/register',
  authLimiter,
  [
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
  ],
  register
);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Authenticates user and updates last login time
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - auth0Id
 *             properties:
 *               auth0Id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       404:
 *         description: User not found
 */
router.post(
  '/login',
  authLimiter,
  [
    body('auth0Id').notEmpty().withMessage('Auth0 ID is required'),
    validate,
  ],
  login
);

/**
 * @openapi
 * /api/auth/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the current user (mainly client-side operation)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, logout);

/**
 * @openapi
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the authenticated user's profile (works with both local JWT and Auth0 tokens)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, getMe);

/**
 * @openapi
 * /api/auth/me:
 *   put:
 *     summary: Update current user profile
 *     description: Updates the authenticated user's profile information
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *               avatar:
 *                 type: string
 *                 format: uri
 *               preferences:
 *                 type: object
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/me',
  authenticate,
  [
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
  ],
  updateMe
);

/**
 * @openapi
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Generate a new access token using a valid refresh token
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: New access token generated
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post(
  '/refresh',
  authLimiter,
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate,
  ],
  refreshAccessToken
);

/**
 * @openapi
 * /api/auth/revoke:
 *   post:
 *     summary: Revoke refresh token
 *     description: Revoke a specific refresh token (logout from one device)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Refresh token revoked
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/revoke',
  authenticate,
  [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    validate,
  ],
  revokeRefreshToken
);

/**
 * @openapi
 * /api/auth/revoke-all:
 *   post:
 *     summary: Revoke all refresh tokens
 *     description: Revoke all refresh tokens for the user (logout from all devices)
 *     tags:
 *       - Authentication
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All refresh tokens revoked
 *       401:
 *         description: Unauthorized
 */
router.post('/revoke-all', authenticate, revokeAllRefreshTokens);

export default router;
