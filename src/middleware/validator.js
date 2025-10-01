import { validationResult } from 'express-validator';
import { ErrorTypes } from '../utils/ApiError.js';

export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    throw ErrorTypes.BAD_REQUEST('Validation failed', formattedErrors);
  }

  next();
};
