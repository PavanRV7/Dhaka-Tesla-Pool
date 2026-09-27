import { apiFetch } from './api';
import type { Area } from '../types/api';

export const areaApi = {
  list: () => apiFetch<{ success: boolean; areas: Area[] }>('/areas')
};
