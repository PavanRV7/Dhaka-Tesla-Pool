import { NextFunction, Response } from 'express';
import { ForbiddenError } from '../utils/errors.js';
import { AuthenticatedRequest } from './auth.js';

export const requireRole = (role: 'PASSENGER' | 'DRIVER') => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new ForbiddenError('Authentication required.'));
    }
    if (req.user.role !== role) {
      return next(new ForbiddenError(`This endpoint requires a ${role} account.`));
    }
    return next();
  };
};
