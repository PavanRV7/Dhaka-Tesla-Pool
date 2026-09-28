import { and, eq, sql, or} from 'drizzle-orm';
import { db } from '../db/client.js';
import { poolMemberships, pools, rideRequests, rideStatusHistory, users, vehicles } from '../db/schema.js';
import { ConflictError, InvalidStateTransitionError, NotFoundError, PoolCapacityError } from '../utils/errors.js';
import { RIDE_STATUSES, VEHICLE_CAPACITY } from '../config/constants.js';
import { addHistoryEntry, validateStatusTransition } from './ride.service.js';
import { calculateFinalFarePaisa } from './fare.service.js';

export const getDriverVehicle = async (driverId: number) => {
  const vehicle = await db.query.vehicles.findFirst({ where: eq(vehicles.driverId, driverId) });
  if (!vehicle) {
    throw new NotFoundError('No Tesla found for this driver.');
  }
  return vehicle;
};

export const setDriverStatus = async (driverId: number, online: boolean) => {
  const vehicle = await getDriverVehicle(driverId);
  return { vehicleId: vehicle.id, online };
};


export const getCurrentPoolForDriver = async (driverId: number) => {
  const vehicle = await getDriverVehicle(driverId);
  return db.query.pools.findFirst({where: and(eq(pools.vehicleId, vehicle.id), or(eq(pools.status, 'OPEN'), eq(pools.status, 'DRIVER_ARRIVED'),eq(pools.status, 'STARTED'))), with: {poolMemberships: {with: {rideRequest: {with: {pickupArea: true, destinationArea: true}}, passenger: true}}}});
};


export const getCompatibleRequestsForDriver = async (driverId: number) => {
  const vehicle = await getDriverVehicle(driverId);
  const activePool = await db.query.pools.findFirst({where: and(eq(pools.vehicleId, vehicle.id), eq(pools.status, 'OPEN'))});
  let occupiedSeats = 0;
  if (activePool) {
    const memberships = await db.select().from(poolMemberships).where(eq(poolMemberships.poolId, activePool.id));
    occupiedSeats = memberships.reduce((sum, membership) => sum + membership.seats, 0);
  }
  const seatsAvailable = Math.max(vehicle.capacity - occupiedSeats, 0);
  const rows = await db.query.rideRequests.findMany({where: eq(rideRequests.status, 'REQUESTED'), with: {passenger: true, pickupArea: true, destinationArea: true}});
  return rows.filter((ride) => {if (ride.passengerId === driverId) return false;return true;}).map((ride) => ({...ride, compatible: true, poolSeatsAvailable: seatsAvailable}));
};

export const acceptRideIntoPool = async ({ driverId, rideId }: { driverId: number; rideId: number }) => {
  const vehicle = await getDriverVehicle(driverId);
  const ride = await db.query.rideRequests.findFirst({ where: eq(rideRequests.id, rideId) });
  if (!ride) throw new NotFoundError('Ride request not found.');
  if (ride.status !== 'REQUESTED') {
    throw new ConflictError('This ride has already been matched or processed.');
  }
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT id FROM vehicles WHERE id = ${vehicle.id} FOR UPDATE`);
    const [activePool] = await tx.select().from(pools).where(and(eq(pools.vehicleId, vehicle.id), eq(pools.status, 'OPEN'))).limit(1);
    let poolId = activePool?.id;
    if (!activePool) {
      const [pool] = await tx.insert(pools).values({ vehicleId: vehicle.id, driverId, status: 'OPEN' }).returning();
      poolId = pool.id;
    }
    const currentMemberships = await tx.select().from(poolMemberships).where(eq(poolMemberships.poolId, poolId));
    const occupiedSeats = currentMemberships.reduce((sum, item) => sum + item.seats, 0);
    if (occupiedSeats + ride.seatsRequested > vehicle.capacity) {
      throw new PoolCapacityError('No seats are available in this Tesla pool.');
    }
    const [membership] = await tx.insert(poolMemberships).values({
      poolId,
      rideRequestId: ride.id,
      passengerId: ride.passengerId,
      seats: ride.seatsRequested,
      farePaisa: ride.estimatedFarePaisa || 0
    }).returning();
    await tx.update(rideRequests).set({ status: 'MATCHED', updatedAt: new Date() }).where(eq(rideRequests.id, rideId));
    await addHistoryEntry({ rideRequestId: rideId, fromStatus: 'REQUESTED', toStatus: 'MATCHED', changedByUserId: driverId, metadata: { poolId } });
    return { poolId, membershipId: membership.id };
  });
};

export const markDriverArrival = async ({ driverId, poolId }: { driverId: number; poolId: number }) => {
  const pool = await db.query.pools.findFirst({ where: and(eq(pools.id, poolId), eq(pools.driverId, driverId)) });
  if (!pool) throw new NotFoundError('Pool not found for this driver.');
  if (pool.status !== 'OPEN') throw new InvalidStateTransitionError('Pool can only arrive while OPEN.');

  await db.update(pools).set({ status: 'DRIVER_ARRIVED', updatedAt: new Date() }).where(eq(pools.id, poolId));
  const membershipRows = await db.select().from(poolMemberships).where(eq(poolMemberships.poolId, poolId));
  for (const membership of membershipRows) {
    await db.update(rideRequests).set({ status: 'DRIVER_ARRIVED', updatedAt: new Date() }).where(eq(rideRequests.id, membership.rideRequestId));
    await addHistoryEntry({ rideRequestId: membership.rideRequestId, fromStatus: 'MATCHED', toStatus: 'DRIVER_ARRIVED', changedByUserId: driverId, metadata: { poolId } });
  }
  return { success: true };
};

export const startPool = async ({ driverId, poolId }: { driverId: number; poolId: number }) => {
  const pool = await db.query.pools.findFirst({ where: and(eq(pools.id, poolId), eq(pools.driverId, driverId)) });
  if (!pool) throw new NotFoundError('Pool not found for this driver.');
  if (pool.status !== 'DRIVER_ARRIVED') throw new InvalidStateTransitionError('Pool can only start after driver arrival.');

  await db.update(pools).set({ status: 'STARTED', startedAt: new Date(), updatedAt: new Date() }).where(eq(pools.id, poolId));
  const memberships = await db.select().from(poolMemberships).where(eq(poolMemberships.poolId, poolId));
  for (const membership of memberships) {
    await db.update(rideRequests).set({ status: 'STARTED', updatedAt: new Date() }).where(eq(rideRequests.id, membership.rideRequestId));
    await addHistoryEntry({ rideRequestId: membership.rideRequestId, fromStatus: 'DRIVER_ARRIVED', toStatus: 'STARTED', changedByUserId: driverId, metadata: { poolId } });
  }
  return { success: true };
};

export const completePool = async ({ driverId, poolId }: { driverId: number; poolId: number }) => {
  const pool = await db.query.pools.findFirst({ where: and(eq(pools.id, poolId), eq(pools.driverId, driverId)) });
  if (!pool) throw new NotFoundError('Pool not found for this driver.');
  if (pool.status !== 'STARTED') throw new InvalidStateTransitionError('Pool can only complete after it has started.');

  await db.update(pools).set({ status: 'COMPLETED', completedAt: new Date(), updatedAt: new Date() }).where(eq(pools.id, poolId));
  const memberships = await db.select().from(poolMemberships).where(eq(poolMemberships.poolId, poolId));
  for (const membership of memberships) {
    const ride = await db.query.rideRequests.findFirst({ where: eq(rideRequests.id, membership.rideRequestId) });
    const finalFare = ride ? ride.estimatedFarePaisa || 0 : membership.farePaisa;
    await db.update(rideRequests).set({ status: 'COMPLETED', finalFarePaisa: finalFare, updatedAt: new Date() }).where(eq(rideRequests.id, membership.rideRequestId));
    await addHistoryEntry({ rideRequestId: membership.rideRequestId, fromStatus: 'STARTED', toStatus: 'COMPLETED', changedByUserId: driverId, metadata: { poolId, finalFarePaisa: finalFare } });
  }
  return { success: true };
};

export const getDriverHistory = async (driverId: number) => {
  const vehicle = await getDriverVehicle(driverId);
  const activePools = await db.query.pools.findMany({
    where: eq(pools.vehicleId, vehicle.id),
    with: { poolMemberships: { with: { rideRequest: true } } }
  });
  return activePools;
};
