import { apiFetch } from './api';
import type { EstimatedFare, Ride } from '../types/api';

export const rideApi = {
  estimate: (payload: { pickupAreaId: number; destinationAreaId: number; seatsRequested: number }) =>
    apiFetch<{ success: boolean; estimate: EstimatedFare & { requestedSeats: number } }>('/rides/estimate', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  create: (payload: { pickupAreaId: number; destinationAreaId: number; seatsRequested: number; paymentMethod: 'CASH' | 'TESLAPAY_WALLET' }) =>
    apiFetch<{ success: boolean; ride: Ride }>('/rides', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  list: () => apiFetch<{ success: boolean; rides: Ride[] }>('/rides'),

  detail: (id: number) => apiFetch<{ success: boolean; ride: Ride }>('/rides/' + id),

  cancel: (id: number) => apiFetch<{ success: boolean; ride: Ride }>('/rides/' + id + '/cancel', { method: 'POST' })
};
