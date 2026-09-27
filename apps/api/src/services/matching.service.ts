import { ROUTE_COMPATIBILITY } from '../config/constants.js';

export interface MatchingRequestLike {
  pickupAreaName: string;
  destinationAreaName: string;
  status: string;
}

export const isRouteCompatible = (pickupA: string, destinationA: string, pickupB: string, destinationB: string) => {
  if (!pickupA || !destinationA || !pickupB || !destinationB) return false;
  if (pickupA !== pickupB) return false;
  if (destinationA === destinationB) return true;

  const compatibleDestinations = ROUTE_COMPATIBILITY.get(pickupA) ?? [];
  return compatibleDestinations.includes(destinationA) && compatibleDestinations.includes(destinationB);
};

export const areRequestsCompatible = (requestA: MatchingRequestLike, requestB: MatchingRequestLike) => {
  if (requestA.status === 'CANCELLED' || requestB.status === 'CANCELLED') return false;
  if (requestA.status === 'COMPLETED' || requestB.status === 'COMPLETED') return false;
  if (requestA.status === 'STARTED' || requestB.status === 'STARTED') return false;

  return isRouteCompatible(
    requestA.pickupAreaName,
    requestA.destinationAreaName,
    requestB.pickupAreaName,
    requestB.destinationAreaName
  );
};
