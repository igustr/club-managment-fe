import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  TrainingSessionDTO,
  CreateTrainingSessionDTO,
  CreateRecurringTrainingDTO,
  UpdateTrainingSessionDTO,
} from '@/types/training.types';

// --- Query key factory ---
export const trainingKeys = {
  all: ['trainings'] as const,
  lists: () => [...trainingKeys.all, 'list'] as const,
  list: (clubId: string) => [...trainingKeys.lists(), clubId] as const,
  details: () => [...trainingKeys.all, 'detail'] as const,
  detail: (clubId: string, trainingId: string) =>
    [...trainingKeys.details(), clubId, trainingId] as const,
};

// --- API functions ---
export const getTrainings = (clubId: string, myTeams?: boolean) =>
  api
    .get<TrainingSessionDTO[]>(`/api/clubs/${clubId}/trainings`, { params: myTeams ? { myTeams: true } : undefined })
    .then((r) => r.data);

export const getTraining = (clubId: string, trainingId: string) =>
  api
    .get<TrainingSessionDTO>(`/api/clubs/${clubId}/trainings/${trainingId}`)
    .then((r) => r.data);

export const createTraining = (
  clubId: string,
  teamId: string,
  data: CreateTrainingSessionDTO,
) =>
  api
    .post<TrainingSessionDTO>(
      `/api/clubs/${clubId}/teams/${teamId}/trainings`,
      data,
    )
    .then((r) => r.data);

export const createRecurringTraining = (
  clubId: string,
  teamId: string,
  data: CreateRecurringTrainingDTO,
) =>
  api
    .post<TrainingSessionDTO[]>(
      `/api/clubs/${clubId}/teams/${teamId}/trainings/recurring`,
      data,
    )
    .then((r) => r.data);

export const updateTraining = (
  clubId: string,
  trainingId: string,
  data: UpdateTrainingSessionDTO,
) =>
  api
    .put<TrainingSessionDTO>(
      `/api/clubs/${clubId}/trainings/${trainingId}`,
      data,
    )
    .then((r) => r.data);

export const cancelTraining = (clubId: string, trainingId: string) =>
  api.put(`/api/clubs/${clubId}/trainings/${trainingId}/cancel`);

export const deleteTraining = (clubId: string, trainingId: string) =>
  api.delete(`/api/clubs/${clubId}/trainings/${trainingId}`);

// --- Query hooks ---
export const useTrainings = (clubId: string | null, myTeams?: boolean) =>
  useQuery({
    queryKey: [...trainingKeys.list(clubId!), { myTeams: !!myTeams }],
    queryFn: () => getTrainings(clubId!, myTeams),
    enabled: !!clubId,
  });

export const useTraining = (clubId: string | null, trainingId: string) =>
  useQuery({
    queryKey: trainingKeys.detail(clubId!, trainingId),
    queryFn: () => getTraining(clubId!, trainingId),
    enabled: !!clubId && !!trainingId,
  });

// --- Mutation hooks ---
export const useCreateTraining = (clubId: string) =>
  useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: CreateTrainingSessionDTO;
    }) => createTraining(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });

export const useCreateRecurringTraining = (clubId: string) =>
  useMutation({
    mutationFn: ({
      teamId,
      data,
    }: {
      teamId: string;
      data: CreateRecurringTrainingDTO;
    }) => createRecurringTraining(clubId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });

export const useUpdateTraining = (clubId: string, trainingId: string) =>
  useMutation({
    mutationFn: (data: UpdateTrainingSessionDTO) =>
      updateTraining(clubId, trainingId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: trainingKeys.detail(clubId, trainingId),
      });
    },
  });

export const useCancelTraining = (clubId: string) =>
  useMutation({
    mutationFn: (trainingId: string) => cancelTraining(clubId, trainingId),
    onSuccess: (_data, trainingId) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: trainingKeys.detail(clubId, trainingId),
      });
    },
  });

export const useDeleteTraining = (clubId: string) =>
  useMutation({
    mutationFn: (trainingId: string) => deleteTraining(clubId, trainingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });
