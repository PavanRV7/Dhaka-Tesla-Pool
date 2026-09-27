import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { env } from '../config/env.js';
import { comparePassword, createJwtToken, hashPassword } from '../services/auth.service.js';
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from '../utils/errors.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { eq } from 'drizzle-orm';

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['PASSENGER', 'DRIVER'])
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export const authRoutes = Router();

authRoutes.post('/register', async (req, res, next) => {
  try {
    const payload = registerSchema.parse(req.body);
    const existing = await db.query.users.findFirst({ where: eq(users.email, payload.email) });
    if (existing) {
      throw new ConflictError('An account already exists with this email address.');
    }

    const passwordHash = await hashPassword(payload.password);
    const [user] = await db.insert(users).values({
      name: payload.name,
      email: payload.email,
      passwordHash,
      role: payload.role
    }).returning();

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.post('/login', async (req, res, next) => {
  try {
    const payload = loginSchema.parse(req.body);
    const user = await db.query.users.findFirst({ where: eq(users.email, payload.email) });
    if (!user) throw new UnauthorizedError('Invalid email or password.');

    const valid = await comparePassword(payload.password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid email or password.');

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    res.json({
      success: true,
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
});

authRoutes.get('/me', authenticate, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, req.user!.id) });
    if (!user) throw new NotFoundError('User not found.');

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
});
