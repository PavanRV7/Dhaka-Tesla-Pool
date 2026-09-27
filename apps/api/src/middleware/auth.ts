import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { UnauthorizedError } from '../utils/errors.js';

export type AuthenticatedRequest = Request & {
  user?: {
    id: number;
    email: string;
    role: 'PASSENGER' | 'DRIVER';
    name: string;
  };
};

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Authentication token is missing.'));
  }

  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = jwt.verify(token, env.jwtSecret) as unknown as {
      sub: number;
      email: string;
      role: 'PASSENGER' | 'DRIVER';
      name: string;
    };

    req.user = {
      id: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name
    };
    return next();
  } catch (error) {
    return next(new UnauthorizedError('The provided token is invalid or expired.'));
  }
};
