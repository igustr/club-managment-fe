import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type { GameDTO, CreateGameDTO, UpdateGameDTO } from '@/types/game.types';

// --- Query key factory ---
export const gameKeys = {
  all: ['games'] as const,
  lists: () => [...gameKeys.all, 'list'] as const,
  list: (clubId: string) => [...gameKeys.lists(), clubId] as const,
  details: () => [...gameKeys.all, 'detail'] as const,
  detail: (clubId: string, gameId: string) =>
    [...gameKeys.details(), clubId, gameId] as const,
};

// --- API functions ---
export const getGames = (clubId: string) =>
  api.get<GameDTO[]>(`/api/clubs/${clubId}/games`).then((r) => r.data);

export const getGame = (clubId: string, gameId: string) =>
  api
    .get<GameDTO>(`/api/clubs/${clubId}/games/${gameId}`)
    .then((r) => r.data);

export const createGame = (
  clubId: string,
  teamId: string,
  data: CreateGameDTO,
) =>
  api
    .post<GameDTO>(`/api/clubs/${clubId}/teams/${teamId}/games`, data)
    .then((r) => r.data);

export const updateGame = (
  clubId: string,
  gameId: string,
  data: UpdateGameDTO,
) =>
  api
    .put<GameDTO>(`/api/clubs/${clubId}/games/${gameId}`, data)
    .then((r) => r.data);

export const cancelGame = (clubId: string, gameId: string) =>
  api.put(`/api/clubs/${clubId}/games/${gameId}/cancel`);

export const deleteGame = (clubId: string, gameId: string) =>
  api.delete(`/api/clubs/${clubId}/games/${gameId}`);

// --- Query hooks ---
export const useGames = (clubId: string | null) =>
  useQuery({
    queryKey: gameKeys.list(clubId!),
    queryFn: () => getGames(clubId!),
    enabled: !!clubId,
  });

export const useGame = (clubId: string | null, gameId: string) =>
  useQuery({
    queryKey: gameKeys.detail(clubId!, gameId),
    queryFn: () => getGame(clubId!, gameId),
    enabled: !!clubId && !!gameId,
  });

// --- Mutation hooks ---
export const useCreateGame = (clubId: string) =>
  useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: CreateGameDTO }) =>
      createGame(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });

export const useUpdateGame = (clubId: string, gameId: string) =>
  useMutation({
    mutationFn: (data: UpdateGameDTO) => updateGame(clubId, gameId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: gameKeys.detail(clubId, gameId),
      });
    },
  });

export const useCancelGame = (clubId: string) =>
  useMutation({
    mutationFn: (gameId: string) => cancelGame(clubId, gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });

export const useDeleteGame = (clubId: string) =>
  useMutation({
    mutationFn: (gameId: string) => deleteGame(clubId, gameId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.lists() });
    },
  });
