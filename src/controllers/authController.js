import { asyncHandler } from '../middleware/errorHandler.js';
import { authService } from '../services/authService.js';
import { ErrorTypes } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const buildRequestContext = (req) => ({
  ipAddress: req.ip || req.connection?.remoteAddress || null,
  userAgent: req.get('user-agent'),
});

export const registerLocal = asyncHandler(async (req, res) => {
  const result = await authService.registerLocal(req.body, buildRequestContext(req));

  res.status(201).json(ApiResponse.success(result));
});

export const loginLocal = asyncHandler(async (req, res) => {
  const result = await authService.loginLocal(req.body, buildRequestContext(req));

  res.json(ApiResponse.success(result));
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerSocial(req.body);

  res.status(201).json(ApiResponse.success(result));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginSocial(req.body);

  res.json(ApiResponse.success(result));
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

  const user = await authService.getProfile(req.user._id);

  res.json(
    ApiResponse.success({
      user,
    })
  );
});

export const updateMe = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('User not authenticated');
  }

  const result = await authService.updateProfile(req.user._id, req.body);

  res.json(ApiResponse.success(result));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const result = await authService.refreshAccessToken(req.body.refreshToken);

  res.json(ApiResponse.success(result));
});

export const revokeRefreshToken = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('User not authenticated');
  }

  const result = await authService.revokeRefreshToken(req.user._id, req.body.refreshToken);

  res.json(ApiResponse.success(result));
});

export const revokeAllRefreshTokens = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw ErrorTypes.UNAUTHORIZED('User not authenticated');
  }

  const result = await authService.revokeAllRefreshTokens(req.user._id);

  res.json(ApiResponse.success(result));
});
