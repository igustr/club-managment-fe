import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  SquadMemberDTO,
  SquadSummaryDTO,
  AddSquadMembersDTO,
  UpdateSquadMemberStatusDTO,
} from '@/types/squad.types';

// --- Query key factory ---
export const tournamentSquadKeys = {
  all: ['tournamentSquad'] as const,
  lists: () => [...tournamentSquadKeys.all, 'list'] as const,
  list: (clubId: string, tournamentId: string) =>
    [...tournamentSquadKeys.lists(), clubId, tournamentId] as const,
  summaries: () => [...tournamentSquadKeys.all, 'summary'] as const,
  summary: (clubId: string, tournamentId: string) =>
    [...tournamentSquadKeys.summaries(), clubId, tournamentId] as const,
};

// --- API functions ---
export const getTournamentSquad = (clubId: string, tournamentId: string) =>
  api
    .get<SquadMemberDTO[]>(
      `/api/clubs/${clubId}/tournaments/${tournamentId}/squad/members`,
    )
    .then((r) => r.data);

export const getTournamentSquadSummary = (
  clubId: string,
  tournamentId: string,
) =>
  api
    .get<SquadSummaryDTO>(
      `/api/clubs/${clubId}/tournaments/${tournamentId}/squad/summary`,
    )
    .then((r) => r.data);

export const addTournamentSquadMembers = (
  clubId: string,
  tournamentId: string,
  data: AddSquadMembersDTO,
) =>
  api
    .post<SquadMemberDTO[]>(
      `/api/clubs/${clubId}/tournaments/${tournamentId}/squad/members`,
      data,
    )
    .then((r) => r.data);

export const removeTournamentSquadMember = (
  clubId: string,
  tournamentId: string,
  userId: string,
) =>
  api.delete(
    `/api/clubs/${clubId}/tournaments/${tournamentId}/squad/members/${userId}`,
  );

export const updateTournamentSquadMemberStatus = (
  clubId: string,
  tournamentId: string,
  userId: string,
  data: UpdateSquadMemberStatusDTO,
) =>
  api
    .put<SquadMemberDTO>(
      `/api/clubs/${clubId}/tournaments/${tournamentId}/squad/members/${userId}`,
      data,
    )
    .then((r) => r.data);

// --- Query hooks ---
export const useTournamentSquad = (
  clubId: string | null,
  tournamentId: string | undefined,
) =>
  useQuery({
    queryKey: tournamentSquadKeys.list(clubId!, tournamentId!),
    queryFn: () => getTournamentSquad(clubId!, tournamentId!),
    enabled: !!clubId && !!tournamentId,
  });

export const useTournamentSquadSummary = (
  clubId: string | null,
  tournamentId: string | undefined,
) =>
  useQuery({
    queryKey: tournamentSquadKeys.summary(clubId!, tournamentId!),
    queryFn: () => getTournamentSquadSummary(clubId!, tournamentId!),
    enabled: !!clubId && !!tournamentId,
  });

// --- Mutation hooks ---
export const useAddTournamentSquadMembers = (
  clubId: string,
  tournamentId: string,
) =>
  useMutation({
    mutationFn: (data: AddSquadMembersDTO) =>
      addTournamentSquadMembers(clubId, tournamentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.list(clubId, tournamentId),
      });
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.summary(clubId, tournamentId),
      });
    },
  });

export const useRemoveTournamentSquadMember = (
  clubId: string,
  tournamentId: string,
) =>
  useMutation({
    mutationFn: (userId: string) =>
      removeTournamentSquadMember(clubId, tournamentId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.list(clubId, tournamentId),
      });
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.summary(clubId, tournamentId),
      });
    },
  });

export const useUpdateTournamentSquadStatus = (
  clubId: string,
  tournamentId: string,
) =>
  useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateSquadMemberStatusDTO;
    }) =>
      updateTournamentSquadMemberStatus(
        clubId,
        tournamentId,
        userId,
        data,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.list(clubId, tournamentId),
      });
      queryClient.invalidateQueries({
        queryKey: tournamentSquadKeys.summary(clubId, tournamentId),
      });
    },
  });
