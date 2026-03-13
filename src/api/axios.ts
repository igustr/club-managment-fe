import axios, { AxiosError } from 'axios';
import { useAuthStore } from '@/stores/authStore';
import i18n from '@/i18n/i18n';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach JWT token + Accept-Language
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  config.headers['Accept-Language'] = i18n.language;
  return config;
});

/**
 * Extract a user-facing error message from an API error response.
 * Uses the backend's translated `detail` field (RFC 7807) when available,
 * falls back to a generic i18n message.
 */
export function getApiErrorMessage(error: unknown): string {
  if (error instanceof AxiosError && error.response?.data) {
    const data = error.response.data;
    if (typeof data.detail === 'string' && data.detail) {
      return data.detail;
    }
    if (typeof data.message === 'string' && data.message) {
      return data.message;
    }
  }
  return i18n.t('error.generic');
}

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/')
    ) {
      originalRequest._retry = true;

      const refreshToken = useAuthStore.getState().refreshToken;
      if (refreshToken) {
        try {
          const { data } = await axios.post(
            `${api.defaults.baseURL}/api/auth/refresh`,
            { refreshToken },
            { headers: { 'Content-Type': 'application/json' } },
          );

          useAuthStore.getState().setTokens(data);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        } catch {
          useAuthStore.getState().logout();
          window.location.href = '/login';
          return Promise.reject(error);
        }
      }

      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  },
);
