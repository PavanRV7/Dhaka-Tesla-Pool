import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { areas, rideRequests } from '../db/schema.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { requireRole } from '../middleware/role.js';
import { createRideRequest, listPassengerRides } from '../services/ride.service.js';
import { calculateEstimate } from '../services/fare.service.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';

const estimateSchema = z.object({
  pickupAreaId: z.number().int().positive(),
  destinationAreaId: z.number().int().positive(),
  seatsRequested: z.number().int().min(1).max(3)
});

const createRideSchema = z.object({
  pickupAreaId: z.number().int().positive(),
  destinationAreaId: z.number().int().positive(),
  seatsRequested: z.number().int().min(1).max(3),
  paymentMethod: z.enum(['CASH', 'TESLAPAY_WALLET'])
});

export const rideRoutes = Router();

rideRoutes.post('/estimate', async (req, res, next) => {
  try {
    const payload = estimateSchema.parse(req.body);
    const pickup = await db.query.areas.findFirst({ where: eq(areas.id, payload.pickupAreaId) });
    const destination = await db.query.areas.findFirst({ where: eq(areas.id, payload.destinationAreaId) });
    if (!pickup || !destination) {
      throw new NotFoundError('Selected area was not found.');
    }
    const estimate = calculateEstimate(pickup.name, destination.name);
    res.json({ success: true, estimate: { ...estimate, requestedSeats: payload.seatsRequested } });
  } catch (error) {
    next(error);
  }
});

rideRoutes.post('/', requireRole('PASSENGER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const payload = createRideSchema.parse(req.body);
    const ride = await createRideRequest({
      passengerId: req.user!.id,
      pickupAreaId: payload.pickupAreaId,
      destinationAreaId: payload.destinationAreaId,
      seatsRequested: payload.seatsRequested,
      paymentMethod: payload.paymentMethod
    });

    res.status(201).json({ success: true, ride });
  } catch (error) {
    next(error);
  }
});

rideRoutes.get('/', requireRole('PASSENGER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rides = await listPassengerRides(req.user!.id);
    res.json({ success: true, rides });
  } catch (error) {
    next(error);
  }
});

rideRoutes.get('/:id', requireRole('PASSENGER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const ride = await db.query.rideRequests.findFirst({where: eq(rideRequests.id, Number(req.params.id)), with: {pickupArea: true, destinationArea: true}});
    if (!ride) throw new NotFoundError('Ride request was not found.');
    if (ride.passengerId !== req.user!.id) {
      throw new ForbiddenError('You cannot access another passenger ride.');
    }
    res.json({ success: true, ride });
  } catch (error) {
    next(error);
  }
});

rideRoutes.post('/:id/cancel', requireRole('PASSENGER'), async (req: AuthenticatedRequest, res, next) => {
  try {
    const rideId = Number(req.params.id);
    const ride = await db.query.rideRequests.findFirst({ where: eq(rideRequests.id, rideId) });
    if (!ride) throw new NotFoundError('Ride request was not found.');
    if (ride.passengerId !== req.user!.id) throw new ForbiddenError('You cannot cancel another passenger ride.');

    const cancelled = await db.update(rideRequests).set({
      status: 'CANCELLED',
      cancelledAt: new Date(),
      updatedAt: new Date()
    }).where(eq(rideRequests.id, rideId)).returning();

    res.json({ success: true, ride: cancelled[0] });
  } catch (error) {
    next(error);
  }
});
