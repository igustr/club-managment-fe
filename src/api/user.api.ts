import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type { UserDTO } from '@/types/auth.types';
import type { AddUserToClubDTO, UpdateUserDTO, LinkParentDTO } from '@/types/user.types';
import type { Page } from '@/types/common.types';

// --- Query key factory ---
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (clubId: string, params?: Record<string, unknown>) =>
    [...userKeys.lists(), clubId, params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (clubId: string, userId: string) =>
    [...userKeys.details(), clubId, userId] as const,
  parents: (clubId: string, userId: string) =>
    [...userKeys.detail(clubId, userId), 'parents'] as const,
  children: (clubId: string, userId: string) =>
    [...userKeys.detail(clubId, userId), 'children'] as const,
  unaffiliated: (params?: Record<string, unknown>) =>
    [...userKeys.all, 'unaffiliated', params] as const,
};

// --- API functions ---
export const getClubUsers = (
  clubId: string,
  params?: { page?: number; size?: number; search?: string; role?: string },
) =>
  api
    .get<Page<UserDTO>>(`/api/clubs/${clubId}/users`, { params })
    .then((r) => r.data);

export const getClubUser = (clubId: string, userId: string) =>
  api.get<UserDTO>(`/api/clubs/${clubId}/users/${userId}`).then((r) => r.data);

export const addUserToClub = (clubId: string, data: AddUserToClubDTO) =>
  api.post<UserDTO>(`/api/clubs/${clubId}/users`, data).then((r) => r.data);

export const updateClubUser = (
  clubId: string,
  userId: string,
  data: UpdateUserDTO,
) =>
  api
    .put<UserDTO>(`/api/clubs/${clubId}/users/${userId}`, data)
    .then((r) => r.data);

export const removeClubUser = (clubId: string, userId: string) =>
  api.delete(`/api/clubs/${clubId}/users/${userId}`);

export const getUnaffiliated = (params?: { search?: string; page?: number; size?: number }) =>
  api
    .get<Page<UserDTO>>('/api/users/unaffiliated', { params })
    .then((r) => r.data);

export const getParents = (clubId: string, userId: string) =>
  api
    .get<UserDTO[]>(`/api/clubs/${clubId}/users/${userId}/parents`)
    .then((r) => r.data);

export const linkParent = (clubId: string, userId: string, data: LinkParentDTO) =>
  api
    .post<UserDTO>(`/api/clubs/${clubId}/users/${userId}/parents`, data)
    .then((r) => r.data);

export const unlinkParent = (clubId: string, userId: string, parentId: string) =>
  api.delete(`/api/clubs/${clubId}/users/${userId}/parents/${parentId}`);

export const getChildren = (clubId: string, userId: string) =>
  api
    .get<UserDTO[]>(`/api/clubs/${clubId}/users/${userId}/children`)
    .then((r) => r.data);

// --- Query hooks ---
export const useClubUsers = (
  clubId: string | null,
  params?: { page?: number; size?: number; search?: string; role?: string },
) =>
  useQuery({
    queryKey: userKeys.list(clubId!, params),
    queryFn: () => getClubUsers(clubId!, params),
    enabled: !!clubId,
  });

export const useClubUser = (clubId: string | null, userId: string | undefined) =>
  useQuery({
    queryKey: userKeys.detail(clubId!, userId!),
    queryFn: () => getClubUser(clubId!, userId!),
    enabled: !!clubId && !!userId,
  });

export const useUnaffiliated = (params?: { search?: string; page?: number; size?: number }) =>
  useQuery({
    queryKey: userKeys.unaffiliated(params),
    queryFn: () => getUnaffiliated(params),
  });

export const useParents = (clubId: string | null, userId: string | undefined) =>
  useQuery({
    queryKey: userKeys.parents(clubId!, userId!),
    queryFn: () => getParents(clubId!, userId!),
    enabled: !!clubId && !!userId,
  });

export const useChildren = (clubId: string | null, userId: string | undefined) =>
  useQuery({
    queryKey: userKeys.children(clubId!, userId!),
    queryFn: () => getChildren(clubId!, userId!),
    enabled: !!clubId && !!userId,
  });

// --- Mutation hooks ---
export const useAddUserToClub = (clubId: string) =>
  useMutation({
    mutationFn: (data: AddUserToClubDTO) => addUserToClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

export const useUpdateClubUser = (clubId: string, userId: string) =>
  useMutation({
    mutationFn: (data: UpdateUserDTO) => updateClubUser(clubId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(clubId, userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

export const useRemoveClubUser = (clubId: string) =>
  useMutation({
    mutationFn: (userId: string) => removeClubUser(clubId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });

export const useLinkParent = (clubId: string, userId: string) =>
  useMutation({
    mutationFn: (data: LinkParentDTO) => linkParent(clubId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.parents(clubId, userId) });
    },
  });

export const useUnlinkParent = (clubId: string, userId: string) =>
  useMutation({
    mutationFn: (parentId: string) => unlinkParent(clubId, userId, parentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.parents(clubId, userId) });
    },
  });
