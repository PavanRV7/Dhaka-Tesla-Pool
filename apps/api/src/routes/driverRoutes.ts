import { Router } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { pools, poolMemberships, rideRequests, vehicles } from '../db/schema.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { acceptRideIntoPool, completePool, getCompatibleRequestsForDriver, getCurrentPoolForDriver, getDriverHistory, getDriverVehicle, markDriverArrival, setDriverStatus, startPool } from '../services/driver.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

const statusSchema = z.object({ online: z.boolean() });
const poolActionSchema = z.object({});

export const driverRoutes = Router();

driverRoutes.patch('/status', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = statusSchema.parse(req.body);
    const result = await setDriverStatus(req.user!.id, payload.online);
    res.json({ success: true, ...result, online: payload.online });
  } catch (error) {
    next(error);
  }
});

driverRoutes.get('/requests', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const requests = await getCompatibleRequestsForDriver(req.user!.id);
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
});

driverRoutes.get('/pool/current', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const pool = await getCurrentPoolForDriver(req.user!.id);
    res.json({ success: true, pool });
  } catch (error) {
    next(error);
  }
});

driverRoutes.post('/rides/:rideId/accept', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = Number(req.params.rideId);
    const result = await acceptRideIntoPool({ driverId: req.user!.id, rideId });
    res.status(201).json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

driverRoutes.post('/pools/:poolId/arrive', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const poolId = Number(req.params.poolId);
    const result = await markDriverArrival({ driverId: req.user!.id, poolId });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

driverRoutes.post('/pools/:poolId/start', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const poolId = Number(req.params.poolId);
    const result = await startPool({ driverId: req.user!.id, poolId });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

driverRoutes.post('/pools/:poolId/complete', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const poolId = Number(req.params.poolId);
    const result = await completePool({ driverId: req.user!.id, poolId });
    res.json({ success: true, result });
  } catch (error) {
    next(error);
  }
});

driverRoutes.get('/history', requireRole('DRIVER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const history = await getDriverHistory(req.user!.id);
    res.json({ success: true, history });
  } catch (error) {
    next(error);
  }
});
