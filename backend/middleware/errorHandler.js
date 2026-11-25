import multer from 'multer';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export function notFoundHandler(req, _res, next) {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error.';
  let details = err.details || null;

  if (err instanceof multer.MulterError) {
    statusCode = 400;
    message = `Upload error: ${err.message}`;
  } else if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid identifier format for field "${err.path}".`;
  } else if (err.code === 11000) {
    statusCode = 409;
    const duplicateKey = Object.keys(err.keyPattern || {})[0] || 'record';
    message = `A record with this ${duplicateKey} already exists.`;
  }

  const payload = {
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(!env.isProduction && statusCode >= 500 ? { stack: err.stack } : {}),
  };

  res.status(statusCode).json(payload);
}
