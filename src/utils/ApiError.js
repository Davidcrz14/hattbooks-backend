export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'ApiError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export const ErrorTypes = {
  BAD_REQUEST: (message = 'Bad Request', details = null) =>
    new ApiError(400, message, details),

  UNAUTHORIZED: (message = 'Unauthorized') =>
    new ApiError(401, message),

  FORBIDDEN: (message = 'Forbidden') =>
    new ApiError(403, message),

  NOT_FOUND: (message = 'Resource not found') =>
    new ApiError(404, message),

  CONFLICT: (message = 'Resource already exists') =>
    new ApiError(409, message),

  INTERNAL_SERVER: (message = 'Internal Server Error') =>
    new ApiError(500, message),
};
