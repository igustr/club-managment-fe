import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type { NotificationDTO } from '@/types/notification.types';
import type { Page } from '@/types/common.types';

// --- Query key factory ---
export const notificationKeys = {
  all: ['notifications'] as const,
  list: (clubId: string) => [...notificationKeys.all, 'list', clubId] as const,
  unreadCount: (clubId: string) =>
    [...notificationKeys.all, 'unread', clubId] as const,
};

// --- API functions ---
export const getNotifications = (
  clubId: string,
  params?: { page?: number; size?: number },
) =>
  api
    .get<Page<NotificationDTO>>(
      `/api/clubs/${clubId}/notifications`,
      { params },
    )
    .then((r) => r.data);

export const getNotificationUnreadCount = (clubId: string) =>
  api
    .get<number>(`/api/clubs/${clubId}/notifications/unread-count`)
    .then((r) => r.data);

export const markNotificationAsRead = (
  clubId: string,
  notificationId: string,
) => api.put(`/api/clubs/${clubId}/notifications/${notificationId}/read`);

export const markAllNotificationsAsRead = (clubId: string) =>
  api.put(`/api/clubs/${clubId}/notifications/read-all`);

// --- Query hooks ---
export const useNotifications = (
  clubId: string | null,
  params?: { page?: number; size?: number },
) =>
  useQuery({
    queryKey: notificationKeys.list(clubId!),
    queryFn: () => getNotifications(clubId!, params),
    enabled: !!clubId,
  });

export const useNotificationUnreadCount = (clubId: string | null) =>
  useQuery({
    queryKey: notificationKeys.unreadCount(clubId!),
    queryFn: () => getNotificationUnreadCount(clubId!),
    enabled: !!clubId,
    refetchInterval: 30000,
  });

// --- Mutation hooks ---
export const useMarkNotificationAsRead = (clubId: string) =>
  useMutation({
    mutationFn: (notificationId: string) =>
      markNotificationAsRead(clubId, notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(clubId),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(clubId),
      });
    },
  });

export const useMarkAllNotificationsAsRead = (clubId: string) =>
  useMutation({
    mutationFn: () => markAllNotificationsAsRead(clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.list(clubId),
      });
      queryClient.invalidateQueries({
        queryKey: notificationKeys.unreadCount(clubId),
      });
    },
  });
