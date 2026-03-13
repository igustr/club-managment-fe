import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  AuthResponseDTO,
  LoginRequestDTO,
  RegisterRequestDTO,
  UserDTO,
} from '@/types/auth.types';

// --- Query key factory ---
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
};

// --- API functions ---
export const login = (data: LoginRequestDTO) =>
  api.post<AuthResponseDTO>('/api/auth/login', data).then((r) => r.data);

export const register = (data: RegisterRequestDTO) =>
  api.post<UserDTO>('/api/auth/register', data).then((r) => r.data);

export const refreshToken = (token: string) =>
  api
    .post<AuthResponseDTO>('/api/auth/refresh', { refreshToken: token })
    .then((r) => r.data);

export const getMe = () =>
  api.get<UserDTO>('/api/auth/me').then((r) => r.data);

// --- Query hooks ---
export const useMe = (enabled = true) =>
  useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled,
    staleTime: 10 * 60 * 1000,
  });

// --- Mutation hooks ---
export const useLogin = () =>
  useMutation({
    mutationFn: login,
  });

export const useRegister = () =>
  useMutation({
    mutationFn: register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
  });
