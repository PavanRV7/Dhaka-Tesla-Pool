import { and, eq, or, sql } from 'drizzle-orm';
import { db } from '../db/client.js';
import { areas, poolMemberships, pools, rideRequests, rideStatusHistory, users, vehicles } from '../db/schema.js';
import { RIDE_STATUSES, VEHICLE_CAPACITY } from '../config/constants.js';
import { ConflictError, InvalidStateTransitionError, NotFoundError, ValidationError } from '../utils/errors.js';
import { calculateEstimate } from './fare.service.js';

const validTransitions: Record<string, string[]> = {
  REQUESTED: ['MATCHED', 'CANCELLED'],
  MATCHED: ['DRIVER_ARRIVED', 'CANCELLED'],
  DRIVER_ARRIVED: ['STARTED'],
  STARTED: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: []
};

export const validateStatusTransition = (from: string, to: string) => {
  if (from === to) return;
  if (!validTransitions[from]?.includes(to)) {
    throw new InvalidStateTransitionError(`Invalid status transition: ${from} -> ${to}`);
  }
};

export const addHistoryEntry = async ({ rideRequestId, fromStatus, toStatus, changedByUserId, metadata }: {
  rideRequestId: number;
  fromStatus: string | null;
  toStatus: string;
  changedByUserId?: number | null;
  metadata?: Record<string, unknown>;
}) => {
  await db.insert(rideStatusHistory).values({
    rideRequestId,
    fromStatus: fromStatus as any,
    toStatus: toStatus as any,
    changedByUserId: changedByUserId ?? null,
    metadata: metadata ?? null
  });
};

export const getRideWithDetails = async (rideId: number) => {
  const ride = await db.query.rideRequests.findFirst({
    where: eq(rideRequests.id, rideId),
    with: {
      passenger: true,
      pickupArea: true,
      destinationArea: true
    }
  });

  if (!ride) {
    throw new NotFoundError(`Ride request ${rideId} was not found.`);
  }

  return ride;
};

export const createRideRequest = async ({
  passengerId,
  pickupAreaId,
  destinationAreaId,
  seatsRequested,
  paymentMethod
}: {
  passengerId: number;
  pickupAreaId: number;
  destinationAreaId: number;
  seatsRequested: number;
  paymentMethod: 'CASH' | 'TESLAPAY_WALLET';
}) => {
  if (pickupAreaId === destinationAreaId) {
    throw new ValidationError('Pickup and destination areas cannot be the same.');
  }
  if (seatsRequested <= 0 || seatsRequested > VEHICLE_CAPACITY) {
    throw new ValidationError('Seats requested must be between 1 and 3.');
  }

  const pickupArea = await db.query.areas.findFirst({ where: eq(areas.id, pickupAreaId) });
  const destinationArea = await db.query.areas.findFirst({ where: eq(areas.id, destinationAreaId) });

  if (!pickupArea || !destinationArea) {
    throw new NotFoundError('Selected area was not found.');
  }

  const estimate = calculateEstimate(pickupArea.name, destinationArea.name);

  const [ride] = await db.insert(rideRequests).values({
    passengerId,
    pickupAreaId,
    destinationAreaId,
    seatsRequested,
    paymentMethod,
    estimatedFarePaisa: estimate.pooledFarePaisa,
    finalFarePaisa: 0
  }).returning();

  await addHistoryEntry({
    rideRequestId: ride.id,
    fromStatus: null,
    toStatus: RIDE_STATUSES.REQUESTED,
    changedByUserId: passengerId,
    metadata: { source: 'ride-created' }
  });

  return { ...ride, estimate };
};

export const listPassengerRides = async (passengerId: number) => {
  return db.query.rideRequests.findMany({
    where: eq(rideRequests.passengerId, passengerId),
    orderBy: (rideRequests, { desc }) => [desc(rideRequests.createdAt)],
    with: {
      pickupArea: true,
      destinationArea: true,
      poolMemberships: true
    }
  });
};

export const cancelRideForPassenger = async ({ rideId, passengerId }: { rideId: number; passengerId: number }) => {
  const [ride] = await db.select().from(rideRequests).where(and(eq(rideRequests.id, rideId), eq(rideRequests.passengerId, passengerId))).limit(1);

  if (!ride) {
    throw new NotFoundError('Ride request was not found.');
  }

  if (ride.status === 'CANCELLED' || ride.status === 'COMPLETED') {
    throw new InvalidStateTransitionError('This ride cannot be cancelled in its current state.');
  }

  if (!['REQUESTED', 'MATCHED'].includes(ride.status)) {
    throw new InvalidStateTransitionError('Passengers can only cancel rides while REQUESTED or MATCHED.');
  }

  validateStatusTransition(ride.status, 'CANCELLED');

  await db.update(rideRequests).set({ status: 'CANCELLED', cancelledAt: new Date(), updatedAt: new Date() }).where(eq(rideRequests.id, rideId));
  await db.update(pools).set({ status: 'CANCELLED', updatedAt: new Date() }).where(eq(pools.id, 0));

  await addHistoryEntry({
    rideRequestId: rideId,
    fromStatus: ride.status,
    toStatus: 'CANCELLED',
    changedByUserId: passengerId,
    metadata: { reason: 'passenger_cancelled' }
  });

  await db.delete(poolMemberships).where(eq(poolMemberships.rideRequestId, rideId));

  return { success: true };
};
