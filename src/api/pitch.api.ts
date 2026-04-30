import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  PitchDTO,
  CreatePitchDTO,
  UpdatePitchDTO,
  PitchOccupancyDTO,
  PitchScheduleDTO,
} from '@/types/pitch.types';
import type { TrainingSessionDTO } from '@/types/training.types';

// --- Query key factory ---
export const pitchKeys = {
  all: ['pitches'] as const,
  lists: () => [...pitchKeys.all, 'list'] as const,
  list: (clubId: string) => [...pitchKeys.lists(), clubId] as const,
  details: () => [...pitchKeys.all, 'detail'] as const,
  detail: (clubId: string, pitchId: string) =>
    [...pitchKeys.details(), clubId, pitchId] as const,
  schedule: (clubId: string, pitchId: string, startDate: string, endDate: string) =>
    [...pitchKeys.all, 'schedule', clubId, pitchId, startDate, endDate] as const,
  overview: (clubId: string, startDate: string, endDate: string) =>
    [...pitchKeys.all, 'overview', clubId, startDate, endDate] as const,
  scheduleOverview: (clubId: string, from: string, to: string) =>
    [...pitchKeys.all, 'scheduleOverview', clubId, from, to] as const,
};

// --- API functions ---
export const getPitches = (clubId: string) =>
  api.get<PitchDTO[]>(`/api/clubs/${clubId}/pitches`).then((r) => r.data);

export const getPitch = (clubId: string, pitchId: string) =>
  api
    .get<PitchDTO>(`/api/clubs/${clubId}/pitches/${pitchId}`)
    .then((r) => r.data);

export const createPitch = (clubId: string, data: CreatePitchDTO) =>
  api
    .post<PitchDTO>(`/api/clubs/${clubId}/pitches`, data)
    .then((r) => r.data);

export const updatePitch = (
  clubId: string,
  pitchId: string,
  data: UpdatePitchDTO,
) =>
  api
    .put<PitchDTO>(`/api/clubs/${clubId}/pitches/${pitchId}`, data)
    .then((r) => r.data);

export const deletePitch = (clubId: string, pitchId: string) =>
  api.delete(`/api/clubs/${clubId}/pitches/${pitchId}`);

export const getPitchSchedule = (
  clubId: string,
  pitchId: string,
  startDate: string,
  endDate: string,
) =>
  api
    .get<TrainingSessionDTO[]>(
      `/api/clubs/${clubId}/pitches/${pitchId}/schedule`,
      { params: { startDate, endDate } },
    )
    .then((r) => r.data);

export const getPitchOverview = (
  clubId: string,
  startDate: string,
  endDate: string,
) =>
  api
    .get<PitchOccupancyDTO[]>(
      `/api/clubs/${clubId}/pitches/overview`,
      { params: { startDate, endDate } },
    )
    .then((r) => r.data);

export const getPitchScheduleOverview = (
  clubId: string,
  from: string,
  to: string,
) =>
  api
    .get<PitchScheduleDTO>(
      `/api/clubs/${clubId}/pitches/schedule`,
      { params: { from, to } },
    )
    .then((r) => r.data);

// --- Query hooks ---
export const usePitches = (clubId: string | null) =>
  useQuery({
    queryKey: pitchKeys.list(clubId!),
    queryFn: () => getPitches(clubId!),
    enabled: !!clubId,
  });

export const usePitch = (clubId: string | null, pitchId: string) =>
  useQuery({
    queryKey: pitchKeys.detail(clubId!, pitchId),
    queryFn: () => getPitch(clubId!, pitchId),
    enabled: !!clubId && !!pitchId,
  });

export const usePitchSchedule = (
  clubId: string | null,
  pitchId: string,
  startDate: string,
  endDate: string,
) =>
  useQuery({
    queryKey: pitchKeys.schedule(clubId!, pitchId, startDate, endDate),
    queryFn: () => getPitchSchedule(clubId!, pitchId, startDate, endDate),
    enabled: !!clubId && !!pitchId && !!startDate && !!endDate,
  });

export const usePitchOverview = (
  clubId: string | null,
  startDate: string,
  endDate: string,
) =>
  useQuery({
    queryKey: pitchKeys.overview(clubId!, startDate, endDate),
    queryFn: () => getPitchOverview(clubId!, startDate, endDate),
    enabled: !!clubId && !!startDate && !!endDate,
  });

export const usePitchScheduleOverview = (
  clubId: string | null,
  from: string,
  to: string,
) =>
  useQuery({
    queryKey: pitchKeys.scheduleOverview(clubId!, from, to),
    queryFn: () => getPitchScheduleOverview(clubId!, from, to),
    enabled: !!clubId && !!from && !!to,
  });

// --- Mutation hooks ---
export const useCreatePitch = (clubId: string) =>
  useMutation({
    mutationFn: (data: CreatePitchDTO) => createPitch(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pitchKeys.lists() });
    },
  });

export const useUpdatePitch = (clubId: string, pitchId: string) =>
  useMutation({
    mutationFn: (data: UpdatePitchDTO) => updatePitch(clubId, pitchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pitchKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: pitchKeys.detail(clubId, pitchId),
      });
    },
  });

export const useDeletePitch = (clubId: string) =>
  useMutation({
    mutationFn: (pitchId: string) => deletePitch(clubId, pitchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pitchKeys.lists() });
    },
  });
