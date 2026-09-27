export type UserRole = 'PASSENGER' | 'DRIVER';

export type Area = {
  id: number;
  name: string;
  latitude: string;
  longitude: string;
};

export type RideStatus =
  | 'REQUESTED'
  | 'MATCHED'
  | 'DRIVER_ARRIVED'
  | 'STARTED'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'TESLAPAY_WALLET';

export type AuthUser = {
  id: number;
  email: string;
  name: string;
  role: UserRole;
};

export type EstimatedFare = {
  distanceKm: number;
  soloFarePaisa: number;
  pooledFarePaisa: number;
  poolDiscountPaisa: number;
};

export type Ride = {
  id: number;
  passengerId: number;
  pickupAreaId: number;
  destinationAreaId: number;
  seatsRequested: number;
  status: RideStatus;
  estimatedFarePaisa: number;
  finalFarePaisa: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string | null;
  pickupArea?: Area;
  destinationArea?: Area;
};
