import { apiFetch } from './api';

export const driverApi = {
  setStatus: (online: boolean) => apiFetch<{ success: boolean; online: boolean; vehicleId: number }>('/driver/status', {
    method: 'PATCH',
    body: JSON.stringify({ online })
  }),

  requests: () => apiFetch<{ success: boolean; requests: any[] }>('/driver/requests'),

  currentPool: () => apiFetch<{ success: boolean; pool: any }>('/driver/pool/current'),

  acceptRide: (rideId: number) => apiFetch<{ success: boolean; result: any }>('/driver/rides/' + rideId + '/accept', { method: 'POST' }),

  markArrival: (poolId: number) => apiFetch<{ success: boolean; result: any }>('/driver/pools/' + poolId + '/arrive', { method: 'POST' }),

  startPool: (poolId: number) => apiFetch<{ success: boolean; result: any }>('/driver/pools/' + poolId + '/start', { method: 'POST' }),

  completePool: (poolId: number) => apiFetch<{ success: boolean; result: any }>('/driver/pools/' + poolId + '/complete', { method: 'POST' }),

  history: () => apiFetch<{ success: boolean; history: any[] }>('/driver/history')
};
