import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type { ClubDTO, UpdateClubDTO } from '@/types/club.types';

// --- Query key factory ---
export const clubKeys = {
  all: ['clubs'] as const,
  detail: (clubId: string) => [...clubKeys.all, clubId] as const,
};

// --- API functions ---
export const getClub = (clubId: string) =>
  api.get<ClubDTO>(`/api/clubs/${clubId}`).then((r) => r.data);

export const updateClub = (clubId: string, data: UpdateClubDTO) =>
  api.put<ClubDTO>(`/api/clubs/${clubId}`, data).then((r) => r.data);

// --- Query hooks ---
export const useClub = (clubId: string | null) =>
  useQuery({
    queryKey: clubKeys.detail(clubId!),
    queryFn: () => getClub(clubId!),
    enabled: !!clubId,
  });

// --- Mutation hooks ---
export const useUpdateClub = (clubId: string) =>
  useMutation({
    mutationFn: (data: UpdateClubDTO) => updateClub(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(clubId) });
    },
  });
