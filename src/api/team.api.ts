import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  TeamDTO,
  CreateTeamDTO,
  UpdateTeamDTO,
  TeamMemberDTO,
  AddTeamMemberDTO,
} from '@/types/team.types';

// --- Query key factory ---
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (clubId: string) => [...teamKeys.lists(), clubId] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (clubId: string, teamId: string) =>
    [...teamKeys.details(), clubId, teamId] as const,
  members: (clubId: string, teamId: string) =>
    [...teamKeys.detail(clubId, teamId), 'members'] as const,
};

// --- API functions ---
export const getTeams = (clubId: string) =>
  api.get<TeamDTO[]>(`/api/clubs/${clubId}/teams`).then((r) => r.data);

export const getTeam = (clubId: string, teamId: string) =>
  api
    .get<TeamDTO>(`/api/clubs/${clubId}/teams/${teamId}`)
    .then((r) => r.data);

export const createTeam = (clubId: string, data: CreateTeamDTO) =>
  api
    .post<TeamDTO>(`/api/clubs/${clubId}/teams`, data)
    .then((r) => r.data);

export const updateTeam = (
  clubId: string,
  teamId: string,
  data: UpdateTeamDTO,
) =>
  api
    .put<TeamDTO>(`/api/clubs/${clubId}/teams/${teamId}`, data)
    .then((r) => r.data);

export const deleteTeam = (clubId: string, teamId: string) =>
  api.delete(`/api/clubs/${clubId}/teams/${teamId}`);

export const getTeamMembers = (clubId: string, teamId: string) =>
  api
    .get<TeamMemberDTO[]>(`/api/clubs/${clubId}/teams/${teamId}/members`)
    .then((r) => r.data);

export const addTeamMember = (
  clubId: string,
  teamId: string,
  data: AddTeamMemberDTO,
) =>
  api
    .post<TeamMemberDTO>(
      `/api/clubs/${clubId}/teams/${teamId}/members`,
      data,
    )
    .then((r) => r.data);

export const removeTeamMember = (
  clubId: string,
  teamId: string,
  userId: string,
) =>
  api.delete(`/api/clubs/${clubId}/teams/${teamId}/members/${userId}`);

// --- Query hooks ---
export const useTeams = (clubId: string | null) =>
  useQuery({
    queryKey: teamKeys.list(clubId!),
    queryFn: () => getTeams(clubId!),
    enabled: !!clubId,
  });

export const useTeam = (clubId: string | null, teamId: string | undefined) =>
  useQuery({
    queryKey: teamKeys.detail(clubId!, teamId!),
    queryFn: () => getTeam(clubId!, teamId!),
    enabled: !!clubId && !!teamId,
  });

export const useTeamMembers = (
  clubId: string | null,
  teamId: string | undefined,
) =>
  useQuery({
    queryKey: teamKeys.members(clubId!, teamId!),
    queryFn: () => getTeamMembers(clubId!, teamId!),
    enabled: !!clubId && !!teamId,
  });

// --- Mutation hooks ---
export const useCreateTeam = (clubId: string) =>
  useMutation({
    mutationFn: (data: CreateTeamDTO) => createTeam(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });

export const useUpdateTeam = (clubId: string, teamId: string) =>
  useMutation({
    mutationFn: (data: UpdateTeamDTO) => updateTeam(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(clubId, teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });

export const useDeleteTeam = (clubId: string) =>
  useMutation({
    mutationFn: (teamId: string) => deleteTeam(clubId, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });

export const useAddTeamMember = (clubId: string, teamId: string) =>
  useMutation({
    mutationFn: (data: AddTeamMemberDTO) =>
      addTeamMember(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(clubId, teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });

export const useRemoveTeamMember = (clubId: string, teamId: string) =>
  useMutation({
    mutationFn: (userId: string) => removeTeamMember(clubId, teamId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.members(clubId, teamId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
