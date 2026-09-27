export const VEHICLE_CAPACITY = 3;
export const BASE_FARE_BDT = 50;
export const DISTANCE_RATE_PER_KM = 20;
export const POOL_DISCOUNT_PERCENT = 0.2;

export const RIDE_STATUSES = {
  REQUESTED: 'REQUESTED',
  MATCHED: 'MATCHED',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export const POOL_STATUSES = {
  OPEN: 'OPEN',
  DRIVER_ARRIVED: 'DRIVER_ARRIVED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

export const PAYMENT_METHODS = {
  CASH: 'CASH',
  TESLAPAY_WALLET: 'TESLAPAY_WALLET'
} as const;

export const USER_ROLES = {
  PASSENGER: 'PASSENGER',
  DRIVER: 'DRIVER'
} as const;

export const DRIVER_STATUS = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE'
} as const;

export const ROUTE_COMPATIBILITY = new Map<string, string[]>([
  ['Banani', ['Mohakhali', 'Gulshan 1']],
  ['Gulshan', ['Mohakhali', 'Gulshan 1']],
  ['Bashundhara', ['Mohakhali', 'Gulshan 1']],
  ['Uttara', ['Mohakhali', 'Gulshan 1']]
]);

export const PROBLEM_AREAS = [
  'Banani',
  'Gulshan',
  'Gulshan 1',
  'Mohakhali',
  'Dhanmondi',
  'Mirpur',
  'Uttara',
  'Farmgate',
  'Bashundhara'
] as const;

export type RideStatus = (typeof RIDE_STATUSES)[keyof typeof RIDE_STATUSES];
export type PoolStatus = (typeof POOL_STATUSES)[keyof typeof POOL_STATUSES];
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];
export type PaymentMethod = (typeof PAYMENT_METHODS)[keyof typeof PAYMENT_METHODS];
