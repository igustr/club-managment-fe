import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  TournamentDTO,
  CreateTournamentDTO,
  UpdateTournamentDTO,
} from '@/types/tournament.types';

// --- Query key factory ---
export const tournamentKeys = {
  all: ['tournaments'] as const,
  lists: () => [...tournamentKeys.all, 'list'] as const,
  list: (clubId: string) => [...tournamentKeys.lists(), clubId] as const,
  details: () => [...tournamentKeys.all, 'detail'] as const,
  detail: (clubId: string, tournamentId: string) =>
    [...tournamentKeys.details(), clubId, tournamentId] as const,
};

// --- API functions ---
export const getTournaments = (clubId: string) =>
  api
    .get<TournamentDTO[]>(`/api/clubs/${clubId}/tournaments`)
    .then((r) => r.data);

export const getTournament = (clubId: string, tournamentId: string) =>
  api
    .get<TournamentDTO>(`/api/clubs/${clubId}/tournaments/${tournamentId}`)
    .then((r) => r.data);

export const createTournament = (
  clubId: string,
  teamId: string,
  data: CreateTournamentDTO,
) =>
  api
    .post<TournamentDTO>(
      `/api/clubs/${clubId}/teams/${teamId}/tournaments`,
      data,
    )
    .then((r) => r.data);

export const updateTournament = (
  clubId: string,
  tournamentId: string,
  data: UpdateTournamentDTO,
) =>
  api
    .put<TournamentDTO>(
      `/api/clubs/${clubId}/tournaments/${tournamentId}`,
      data,
    )
    .then((r) => r.data);

export const cancelTournament = (clubId: string, tournamentId: string) =>
  api.put(`/api/clubs/${clubId}/tournaments/${tournamentId}/cancel`);

export const deleteTournament = (clubId: string, tournamentId: string) =>
  api.delete(`/api/clubs/${clubId}/tournaments/${tournamentId}`);

// --- Query hooks ---
export const useTournaments = (clubId: string | null) =>
  useQuery({
    queryKey: tournamentKeys.list(clubId!),
    queryFn: () => getTournaments(clubId!),
    enabled: !!clubId,
  });

export const useTournament = (
  clubId: string | null,
  tournamentId: string,
) =>
  useQuery({
    queryKey: tournamentKeys.detail(clubId!, tournamentId),
    queryFn: () => getTournament(clubId!, tournamentId),
    enabled: !!clubId && !!tournamentId,
  });

// --- Mutation hooks ---
export const useCreateTournament = (clubId: string) =>
  useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: CreateTournamentDTO;
    }) => createTournament(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });

export const useUpdateTournament = (
  clubId: string,
  tournamentId: string,
) =>
  useMutation({
    mutationFn: (data: UpdateTournamentDTO) =>
      updateTournament(clubId, tournamentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: tournamentKeys.detail(clubId, tournamentId),
      });
    },
  });

export const useCancelTournament = (clubId: string) =>
  useMutation({
    mutationFn: (tournamentId: string) =>
      cancelTournament(clubId, tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });

export const useDeleteTournament = (clubId: string) =>
  useMutation({
    mutationFn: (tournamentId: string) =>
      deleteTournament(clubId, tournamentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tournamentKeys.lists() });
    },
  });
