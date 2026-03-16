import { useQuery } from '@tanstack/react-query';
import { api } from './axios';
import type {
  PlayerStatisticsDTO,
  TeamStatisticsDTO,
  ClubStatisticsDTO,
} from '@/types/statistics.types';

// --- Query key factory ---
export const statisticsKeys = {
  all: ['statistics'] as const,
  player: (clubId: string, userId: string) =>
    [...statisticsKeys.all, 'player', clubId, userId] as const,
  team: (clubId: string, teamId: string) =>
    [...statisticsKeys.all, 'team', clubId, teamId] as const,
  club: (clubId: string) =>
    [...statisticsKeys.all, 'club', clubId] as const,
};

// --- API functions ---
export const getPlayerStatistics = (clubId: string, userId: string) =>
  api
    .get<PlayerStatisticsDTO>(`/clubs/${clubId}/users/${userId}/statistics`)
    .then((r) => r.data);

export const getTeamStatistics = (clubId: string, teamId: string) =>
  api
    .get<TeamStatisticsDTO>(`/clubs/${clubId}/teams/${teamId}/statistics`)
    .then((r) => r.data);

export const getClubStatistics = (clubId: string) =>
  api
    .get<ClubStatisticsDTO>(`/clubs/${clubId}/statistics`)
    .then((r) => r.data);

// --- TanStack Query hooks ---
export const usePlayerStatistics = (
  clubId: string | null | undefined,
  userId: string | null | undefined,
) =>
  useQuery({
    queryKey: statisticsKeys.player(clubId!, userId!),
    queryFn: () => getPlayerStatistics(clubId!, userId!),
    enabled: !!clubId && !!userId,
  });

export const useTeamStatistics = (
  clubId: string | null | undefined,
  teamId: string | null | undefined,
) =>
  useQuery({
    queryKey: statisticsKeys.team(clubId!, teamId!),
    queryFn: () => getTeamStatistics(clubId!, teamId!),
    enabled: !!clubId && !!teamId,
  });

export const useClubStatistics = (clubId: string | null | undefined) =>
  useQuery({
    queryKey: statisticsKeys.club(clubId!),
    queryFn: () => getClubStatistics(clubId!),
    enabled: !!clubId,
  });
