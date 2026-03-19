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
export const gameSquadKeys = {
  all: ['gameSquad'] as const,
  lists: () => [...gameSquadKeys.all, 'list'] as const,
  list: (clubId: string, gameId: string) =>
    [...gameSquadKeys.lists(), clubId, gameId] as const,
  summaries: () => [...gameSquadKeys.all, 'summary'] as const,
  summary: (clubId: string, gameId: string) =>
    [...gameSquadKeys.summaries(), clubId, gameId] as const,
};

// --- API functions ---
export const getGameSquad = (clubId: string, gameId: string) =>
  api
    .get<SquadMemberDTO[]>(
      `/api/clubs/${clubId}/games/${gameId}/squad/members`,
    )
    .then((r) => r.data);

export const getGameSquadSummary = (clubId: string, gameId: string) =>
  api
    .get<SquadSummaryDTO>(
      `/api/clubs/${clubId}/games/${gameId}/squad/summary`,
    )
    .then((r) => r.data);

export const addGameSquadMembers = (
  clubId: string,
  gameId: string,
  data: AddSquadMembersDTO,
) =>
  api
    .post<SquadMemberDTO[]>(
      `/api/clubs/${clubId}/games/${gameId}/squad/members`,
      data,
    )
    .then((r) => r.data);

export const removeGameSquadMember = (
  clubId: string,
  gameId: string,
  userId: string,
) =>
  api.delete(
    `/api/clubs/${clubId}/games/${gameId}/squad/members/${userId}`,
  );

export const updateGameSquadMemberStatus = (
  clubId: string,
  gameId: string,
  userId: string,
  data: UpdateSquadMemberStatusDTO,
) =>
  api
    .put<SquadMemberDTO>(
      `/api/clubs/${clubId}/games/${gameId}/squad/members/${userId}`,
      data,
    )
    .then((r) => r.data);

// --- Query hooks ---
export const useGameSquad = (
  clubId: string | null,
  gameId: string | undefined,
) =>
  useQuery({
    queryKey: gameSquadKeys.list(clubId!, gameId!),
    queryFn: () => getGameSquad(clubId!, gameId!),
    enabled: !!clubId && !!gameId,
  });

export const useGameSquadSummary = (
  clubId: string | null,
  gameId: string | undefined,
) =>
  useQuery({
    queryKey: gameSquadKeys.summary(clubId!, gameId!),
    queryFn: () => getGameSquadSummary(clubId!, gameId!),
    enabled: !!clubId && !!gameId,
  });

// --- Mutation hooks ---
export const useAddGameSquadMembers = (clubId: string, gameId: string) =>
  useMutation({
    mutationFn: (data: AddSquadMembersDTO) =>
      addGameSquadMembers(clubId, gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.list(clubId, gameId),
      });
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.summary(clubId, gameId),
      });
    },
  });

export const useRemoveGameSquadMember = (clubId: string, gameId: string) =>
  useMutation({
    mutationFn: (userId: string) =>
      removeGameSquadMember(clubId, gameId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.list(clubId, gameId),
      });
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.summary(clubId, gameId),
      });
    },
  });

export const useUpdateGameSquadStatus = (clubId: string, gameId: string) =>
  useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateSquadMemberStatusDTO;
    }) => updateGameSquadMemberStatus(clubId, gameId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.list(clubId, gameId),
      });
      queryClient.invalidateQueries({
        queryKey: gameSquadKeys.summary(clubId, gameId),
      });
    },
  });
