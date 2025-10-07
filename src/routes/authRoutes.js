import express from 'express';
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
import {
    loginLocalValidators,
    loginSocialValidators,
    refreshTokenValidators,
    registerLocalValidators,
    registerSocialValidators,
    revokeTokenValidators,
    updateProfileValidators,
} from '../validators/authValidators.js';

const router = express.Router();

router.post('/register-local', authLimiter, registerLocalValidators, registerLocal);
router.post('/login-local', authLimiter, loginLocalValidators, loginLocal);
router.post('/register', authLimiter, registerSocialValidators, register);
router.post('/login', authLimiter, loginSocialValidators, login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getMe);
router.put('/me', authenticate, updateProfileValidators, updateMe);
router.post('/refresh', authLimiter, refreshTokenValidators, refreshAccessToken);
router.post('/revoke', authenticate, revokeTokenValidators, revokeRefreshToken);
router.post('/revoke-all', authenticate, revokeAllRefreshTokens);

export default router;
