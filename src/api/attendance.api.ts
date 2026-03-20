import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  AttendanceDTO,
  AttendanceSummaryDTO,
  UpdateAttendanceDTO,
} from '@/types/attendance.types';

// --- Query key factory ---
export const attendanceKeys = {
  all: ['attendance'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (clubId: string, trainingId: string) =>
    [...attendanceKeys.lists(), clubId, trainingId] as const,
  summaries: () => [...attendanceKeys.all, 'summary'] as const,
  summary: (clubId: string, trainingId: string) =>
    [...attendanceKeys.summaries(), clubId, trainingId] as const,
  mine: (clubId: string, trainingId: string) =>
    [...attendanceKeys.all, 'mine', clubId, trainingId] as const,
  myAll: (clubId: string) =>
    [...attendanceKeys.all, 'myAll', clubId] as const,
};

// --- API functions ---
export const getAttendanceList = (clubId: string, trainingId: string) =>
  api
    .get<AttendanceDTO[]>(
      `/api/clubs/${clubId}/trainings/${trainingId}/attendance`,
    )
    .then((r) => r.data);

export const getAttendanceSummary = (clubId: string, trainingId: string) =>
  api
    .get<AttendanceSummaryDTO>(
      `/api/clubs/${clubId}/trainings/${trainingId}/attendance/summary`,
    )
    .then((r) => r.data);

export const getMyAttendance = (
  clubId: string,
  trainingId: string,
  userId?: string,
) =>
  api
    .get<AttendanceDTO>(
      `/api/clubs/${clubId}/trainings/${trainingId}/attendance/mine`,
      { params: userId ? { userId } : undefined },
    )
    .then((r) => r.data);

export const getMyAttendances = (clubId: string) =>
  api
    .get<AttendanceDTO[]>(`/api/clubs/${clubId}/attendance/mine`)
    .then((r) => r.data);

export const updateAttendance = (
  clubId: string,
  trainingId: string,
  userId: string,
  data: UpdateAttendanceDTO,
) =>
  api
    .put<AttendanceDTO>(
      `/api/clubs/${clubId}/trainings/${trainingId}/attendance/${userId}`,
      data,
    )
    .then((r) => r.data);

// --- Query hooks ---
export const useAttendanceList = (
  clubId: string | null,
  trainingId: string | undefined,
) =>
  useQuery({
    queryKey: attendanceKeys.list(clubId!, trainingId!),
    queryFn: () => getAttendanceList(clubId!, trainingId!),
    enabled: !!clubId && !!trainingId,
  });

export const useAttendanceSummary = (
  clubId: string | null,
  trainingId: string | undefined,
) =>
  useQuery({
    queryKey: attendanceKeys.summary(clubId!, trainingId!),
    queryFn: () => getAttendanceSummary(clubId!, trainingId!),
    enabled: !!clubId && !!trainingId,
  });

export const useMyAttendances = (clubId: string | null) =>
  useQuery({
    queryKey: attendanceKeys.myAll(clubId!),
    queryFn: () => getMyAttendances(clubId!),
    enabled: !!clubId,
  });

export const useMyAttendance = (
  clubId: string | null,
  trainingId: string | undefined,
  userId?: string,
) =>
  useQuery({
    queryKey: [...attendanceKeys.mine(clubId!, trainingId!), userId ?? 'self'],
    queryFn: () => getMyAttendance(clubId!, trainingId!, userId),
    enabled: !!clubId && !!trainingId,
    retry: false,
  });

// --- Mutation hooks ---
export const useUpdateAttendance = (clubId: string, trainingId: string) =>
  useMutation({
    mutationFn: ({
      userId,
      data,
    }: {
      userId: string;
      data: UpdateAttendanceDTO;
    }) => updateAttendance(clubId, trainingId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.list(clubId, trainingId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.summary(clubId, trainingId),
      });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.mine(clubId, trainingId),
      });
    },
  });
