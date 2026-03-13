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
    },
  });
