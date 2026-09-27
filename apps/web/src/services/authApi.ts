import { apiFetch } from './api';
import type { AuthUser } from '../types/api';

export const authApi = {
  register: (payload: { name: string; email: string; password: string; role: 'PASSENGER' | 'DRIVER' }) =>
    apiFetch<{ success: boolean; token: string; user: AuthUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  login: (payload: { email: string; password: string }) =>
    apiFetch<{ success: boolean; token: string; user: AuthUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  me: () => apiFetch<{ success: boolean; user: AuthUser }>('/auth/me')
};
