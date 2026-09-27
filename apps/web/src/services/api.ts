export const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

export type ApiError = {
  code: string;
  message: string;
};

export const getAuthToken = () => localStorage.getItem('dtp_token');

export const apiFetch = async <T>(path: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers ?? {})
    }
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error?.message ?? 'Something went wrong. Please try again.');
  }

  return data as T;
};
