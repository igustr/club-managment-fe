import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type { ClubDTO } from '@/types/club.types';
import type { UserDTO } from '@/types/auth.types';
import type {
  CreateClubDTO,
  AdminCreateUserDTO,
  AssignAdminDTO,
} from '@/types/admin.types';
import type { Page } from '@/types/common.types';

// --- Query key factory ---
export const adminKeys = {
  all: ['admin'] as const,
  clubs: () => [...adminKeys.all, 'clubs'] as const,
  clubList: (params: { search?: string; page?: number; size?: number }) =>
    [...adminKeys.clubs(), params] as const,
  clubDetail: (clubId: string) => [...adminKeys.clubs(), clubId] as const,
  clubMembers: (clubId: string) =>
    [...adminKeys.clubs(), clubId, 'members'] as const,
  users: () => [...adminKeys.all, 'users'] as const,
  userList: (params: {
    search?: string;
    clubId?: string;
    unaffiliated?: boolean;
    page?: number;
    size?: number;
  }) => [...adminKeys.users(), params] as const,
};

// --- API functions ---
export const getAdminClubs = (params: {
  search?: string;
  page?: number;
  size?: number;
}) =>
  api
    .get<Page<ClubDTO>>('/api/admin/clubs', { params })
    .then((r) => r.data);

export const createClub = (data: CreateClubDTO) =>
  api.post<ClubDTO>('/api/admin/clubs', data).then((r) => r.data);

export const deleteClub = (clubId: string) =>
  api.delete(`/api/admin/clubs/${clubId}`);

export const getAdminUsers = (params: {
  search?: string;
  clubId?: string;
  unaffiliated?: boolean;
  page?: number;
  size?: number;
}) =>
  api
    .get<Page<UserDTO>>('/api/admin/users', { params })
    .then((r) => r.data);

export const adminCreateUser = (data: AdminCreateUserDTO) =>
  api.post<UserDTO>('/api/admin/users', data).then((r) => r.data);

export const assignClubAdmin = (clubId: string, data: AssignAdminDTO) =>
  api
    .post<UserDTO>(`/api/admin/clubs/${clubId}/admins`, data)
    .then((r) => r.data);

export const getClubMembers = (clubId: string, params?: { page?: number; size?: number }) =>
  api
    .get<Page<UserDTO>>(`/api/clubs/${clubId}/users`, { params })
    .then((r) => r.data);

// --- Query hooks ---
export const useAdminClubs = (params: {
  search?: string;
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: adminKeys.clubList(params),
    queryFn: () => getAdminClubs(params),
  });

export const useAdminUsers = (params: {
  search?: string;
  clubId?: string;
  unaffiliated?: boolean;
  page?: number;
  size?: number;
}) =>
  useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => getAdminUsers(params),
  });

export const useClubMembers = (clubId: string, params?: { page?: number; size?: number }) =>
  useQuery({
    queryKey: adminKeys.clubMembers(clubId),
    queryFn: () => getClubMembers(clubId, params),
    enabled: !!clubId,
  });

// --- Mutation hooks ---
export const useCreateClub = () =>
  useMutation({
    mutationFn: createClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.clubs() });
    },
  });

export const useDeleteClub = () =>
  useMutation({
    mutationFn: deleteClub,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.clubs() });
    },
  });

export const useAdminCreateUser = () =>
  useMutation({
    mutationFn: adminCreateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });

export const useAssignClubAdmin = (clubId: string) =>
  useMutation({
    mutationFn: (data: AssignAdminDTO) => assignClubAdmin(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.clubs() });
      queryClient.invalidateQueries({ queryKey: adminKeys.users() });
    },
  });
