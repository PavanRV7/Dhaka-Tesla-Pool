import { relations } from 'drizzle-orm';
import {pgEnum, pgTable, serial, integer, text, timestamp, json, uniqueIndex, index, varchar} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['PASSENGER', 'DRIVER']);
export const rideStatusEnum = pgEnum('ride_status', ['REQUESTED', 'MATCHED', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED']);
export const poolStatusEnum = pgEnum('pool_status', ['OPEN', 'DRIVER_ARRIVED', 'STARTED', 'COMPLETED', 'CANCELLED']);
export const paymentMethodEnum = pgEnum('payment_method', ['CASH', 'TESLAPAY_WALLET']);
export const vehicleTypeEnum = pgEnum('vehicle_type', ['Tesla']);

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  emailIdx: uniqueIndex('users_email_unique').on(table.email)
}));

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  driverId: integer('driver_id').notNull().references(() => users.id),
  name: text('name').notNull(),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  capacity: integer('capacity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
}, (table) => ({
  driverIdx: index('vehicles_driver_id_idx').on(table.driverId)
}));

export const areas = pgTable('areas', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  latitude: text('latitude').notNull(),
  longitude: text('longitude').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const rideRequests = pgTable('ride_requests', {
  id: serial('id').primaryKey(),
  passengerId: integer('passenger_id').notNull().references(() => users.id),
  pickupAreaId: integer('pickup_area_id').notNull().references(() => areas.id),
  destinationAreaId: integer('destination_area_id').notNull().references(() => areas.id),
  seatsRequested: integer('seats_requested').notNull(),
  status: rideStatusEnum('status').notNull().default('REQUESTED'),
  estimatedFarePaisa: integer('estimated_fare_paisa').notNull().default(0),
  finalFarePaisa: integer('final_fare_paisa').notNull().default(0),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at')
}, (table) => ({
  passengerIdx: index('ride_requests_passenger_id_idx').on(table.passengerId),
  statusIdx: index('ride_requests_status_idx').on(table.status),
  pickupIdx: index('ride_requests_pickup_idx').on(table.pickupAreaId),
  destinationIdx: index('ride_requests_destination_idx').on(table.destinationAreaId),
  createdAtIdx: index('ride_requests_created_at_idx').on(table.createdAt)
}));

export const pools = pgTable('pools', {
  id: serial('id').primaryKey(),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  driverId: integer('driver_id').notNull().references(() => users.id),
  status: poolStatusEnum('status').notNull().default('OPEN'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at')
}, (table) => ({
  vehicleIdx: index('pools_vehicle_id_idx').on(table.vehicleId),
  statusIdx: index('pools_status_idx').on(table.status),
  driverIdx: index('pools_driver_id_idx').on(table.driverId)
}));

export const poolMemberships = pgTable('pool_memberships', {
  id: serial('id').primaryKey(),
  poolId: integer('pool_id').notNull().references(() => pools.id),
  rideRequestId: integer('ride_request_id').notNull().references(() => rideRequests.id),
  passengerId: integer('passenger_id').notNull().references(() => users.id),
  seats: integer('seats').notNull(),
  farePaisa: integer('fare_paisa').notNull().default(0),
  joinedAt: timestamp('joined_at').defaultNow().notNull()
}, (table) => ({
  poolIdx: index('pool_memberships_pool_id_idx').on(table.poolId),
  rideRequestIdx: index('pool_memberships_ride_request_id_idx').on(table.rideRequestId),
  uniqueRideMembership: uniqueIndex('pool_memberships_ride_request_unique').on(table.rideRequestId)
}));

export const rideStatusHistory = pgTable('ride_status_history', {
  id: serial('id').primaryKey(),
  rideRequestId: integer('ride_request_id').notNull().references(() => rideRequests.id),
  fromStatus: rideStatusEnum('from_status'),
  toStatus: rideStatusEnum('to_status').notNull(),
  changedByUserId: integer('changed_by_user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  metadata: json('metadata')
}, (table) => ({
  rideRequestIdx: index('ride_status_history_ride_request_id_idx').on(table.rideRequestId)
}));

export const usersRelations = relations(users, ({ many }) => ({
  vehicles: many(vehicles),
  passengerRides: many(rideRequests),
  driverPools: many(pools),
  poolMemberships: many(poolMemberships),
  changedRideStatuses: many(rideStatusHistory)
}));

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  driver: one(users, {
    fields: [vehicles.driverId],
    references: [users.id]
  }),
  pools: many(pools)
}));

export const areasRelations = relations(areas, ({ many }) => ({
  pickupRides: many(rideRequests, {
    relationName: 'pickupArea'
  }),
  destinationRides: many(rideRequests, {
    relationName: 'destinationArea'
  })
}));

export const rideRequestsRelations = relations(rideRequests, ({ one, many }) => ({
  passenger: one(users, {
    fields: [rideRequests.passengerId],
    references: [users.id]
  }),

  pickupArea: one(areas, {
    fields: [rideRequests.pickupAreaId],
    references: [areas.id],
    relationName: 'pickupArea'
  }),

  destinationArea: one(areas, {
    fields: [rideRequests.destinationAreaId],
    references: [areas.id],
    relationName: 'destinationArea'
  }),

  poolMemberships: many(poolMemberships),

  statusHistory: many(rideStatusHistory)
}));

export const poolsRelations = relations(pools, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [pools.vehicleId],
    references: [vehicles.id]
  }),

  driver: one(users, {
    fields: [pools.driverId],
    references: [users.id]
  }),

  poolMemberships: many(poolMemberships)
}));

export const poolMembershipsRelations = relations(poolMemberships, ({ one }) => ({
  pool: one(pools, {
    fields: [poolMemberships.poolId],
    references: [pools.id]
  }),

  rideRequest: one(rideRequests, {
    fields: [poolMemberships.rideRequestId],
    references: [rideRequests.id]
  }),

  passenger: one(users, {
    fields: [poolMemberships.passengerId],
    references: [users.id]
  })
}));

export const rideStatusHistoryRelations = relations(
  rideStatusHistory,
  ({ one }) => ({
    rideRequest: one(rideRequests, {
      fields: [rideStatusHistory.rideRequestId],
      references: [rideRequests.id]
    }),

    changedByUser: one(users, {
      fields: [rideStatusHistory.changedByUserId],
      references: [users.id]
    })
  })
);