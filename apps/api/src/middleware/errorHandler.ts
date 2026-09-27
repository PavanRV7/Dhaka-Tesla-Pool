import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (error: Error, _req: Request, res: Response, _next: NextFunction) => {
  const appError = error instanceof AppError ? error : new AppError('Something went wrong.', 500, 'INTERNAL_ERROR');

  if (appError.statusCode >= 500) {
    logger.error('Unhandled error:', error);
  }

  return res.status(appError.statusCode).json({
    success: false,
    error: {
      code: appError.code,
      message: appError.message
    }
  });
};
