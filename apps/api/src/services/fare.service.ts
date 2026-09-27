import { BASE_FARE_BDT, DISTANCE_RATE_PER_KM, POOL_DISCOUNT_PERCENT } from '../config/constants.js';

export const DISTANCE_TABLE: Record<string, number> = {
  'Banani->Mohakhali': 3,
  'Banani->Gulshan 1': 4,
  'Banani->Gulshan': 4,
  'Gulshan->Mohakhali': 3,
  'Gulshan 1->Mohakhali': 3,
  'Gulshan 1->Gulshan': 2,
  'Mohakhali->Dhanmondi': 5,
  'Mirpur->Banani': 6,
  'Uttara->Banani': 7,
  'Farmgate->Banani': 4,
  'Bashundhara->Banani': 8
};

export const getDistanceKm = (pickup: string, destination: string) => {
  const key = `${pickup}->${destination}`;
  const reverseKey = `${destination}->${pickup}`;
  return DISTANCE_TABLE[key] ?? DISTANCE_TABLE[reverseKey] ?? 5;
};

export const calculateSoloFarePaisa = (distanceKm: number) => {
  const totalBdt = BASE_FARE_BDT + distanceKm * DISTANCE_RATE_PER_KM;
  return Math.round(totalBdt * 100);
};

export const calculatePoolDiscountPaisa = (soloFarePaisa: number) => {
  return Math.round(soloFarePaisa * POOL_DISCOUNT_PERCENT);
};

export const calculateFinalFarePaisa = (soloFarePaisa: number, poolMemberCount: number) => {
  if (poolMemberCount < 2) {
    return soloFarePaisa;
  }
  return soloFarePaisa - calculatePoolDiscountPaisa(soloFarePaisa);
};

export const calculateEstimate = (pickup: string, destination: string) => {
  const distanceKm = getDistanceKm(pickup, destination);
  const soloFarePaisa = calculateSoloFarePaisa(distanceKm);
  const pooledFarePaisa = calculateFinalFarePaisa(soloFarePaisa, 2);
  return {
    distanceKm,
    soloFarePaisa,
    pooledFarePaisa,
    poolDiscountPaisa: calculatePoolDiscountPaisa(soloFarePaisa)
  };
};
