import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from './axios';
import { queryClient } from './query-client';
import type {
  ConversationDTO,
  MessageDTO,
  SendMessageDTO,
  CreateDirectConversationDTO,
} from '@/types/chat.types';
import type { Page } from '@/types/common.types';

// --- Query key factory ---
export const chatKeys = {
  all: ['chat'] as const,
  conversations: () => [...chatKeys.all, 'conversations'] as const,
  conversationList: (clubId: string) =>
    [...chatKeys.conversations(), clubId] as const,
  conversation: (clubId: string, conversationId: string) =>
    [...chatKeys.conversations(), clubId, conversationId] as const,
  messages: (clubId: string, conversationId: string) =>
    [...chatKeys.all, 'messages', clubId, conversationId] as const,
  unreadCount: (clubId: string) =>
    [...chatKeys.all, 'unread', clubId] as const,
};

// --- API functions ---
export const getConversations = (clubId: string) =>
  api
    .get<ConversationDTO[]>(`/api/clubs/${clubId}/conversations`)
    .then((r) => r.data);

export const getConversation = (clubId: string, conversationId: string) =>
  api
    .get<ConversationDTO>(
      `/api/clubs/${clubId}/conversations/${conversationId}`,
    )
    .then((r) => r.data);

export const createDirectConversation = (
  clubId: string,
  data: CreateDirectConversationDTO,
) =>
  api
    .post<ConversationDTO>(`/api/clubs/${clubId}/conversations`, data)
    .then((r) => r.data);

export const getMessages = (
  clubId: string,
  conversationId: string,
  params?: { page?: number; size?: number },
) =>
  api
    .get<Page<MessageDTO>>(
      `/api/clubs/${clubId}/conversations/${conversationId}/messages`,
      { params },
    )
    .then((r) => r.data);

export const sendMessage = (
  clubId: string,
  conversationId: string,
  data: SendMessageDTO,
) =>
  api
    .post<MessageDTO>(
      `/api/clubs/${clubId}/conversations/${conversationId}/messages`,
      data,
    )
    .then((r) => r.data);

export const markAsRead = (clubId: string, conversationId: string) =>
  api.put(`/api/clubs/${clubId}/conversations/${conversationId}/read`);

export const getUnreadCount = (clubId: string) =>
  api
    .get<{ unreadCount: number }>(
      `/api/clubs/${clubId}/conversations/unread-count`,
    )
    .then((r) => r.data.unreadCount);

// --- Query hooks ---
export const useConversations = (clubId: string | null) =>
  useQuery({
    queryKey: chatKeys.conversationList(clubId!),
    queryFn: () => getConversations(clubId!),
    enabled: !!clubId,
  });

export const useConversation = (
  clubId: string | null,
  conversationId: string | undefined,
) =>
  useQuery({
    queryKey: chatKeys.conversation(clubId!, conversationId!),
    queryFn: () => getConversation(clubId!, conversationId!),
    enabled: !!clubId && !!conversationId,
  });

export const useMessages = (
  clubId: string | null,
  conversationId: string | undefined,
  params?: { page?: number; size?: number },
) =>
  useQuery({
    queryKey: chatKeys.messages(clubId!, conversationId!),
    queryFn: () => getMessages(clubId!, conversationId!, params),
    enabled: !!clubId && !!conversationId,
    refetchInterval: 10000,
  });

export const useUnreadCount = (clubId: string | null) =>
  useQuery({
    queryKey: chatKeys.unreadCount(clubId!),
    queryFn: () => getUnreadCount(clubId!),
    enabled: !!clubId,
    refetchInterval: 30000,
  });

// --- Mutation hooks ---
export const useCreateDirectConversation = (clubId: string) =>
  useMutation({
    mutationFn: (data: CreateDirectConversationDTO) =>
      createDirectConversation(clubId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversationList(clubId),
      });
    },
  });

export const useSendMessage = (clubId: string, conversationId: string) =>
  useMutation({
    mutationFn: (data: SendMessageDTO) =>
      sendMessage(clubId, conversationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.messages(clubId, conversationId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversationList(clubId),
      });
    },
  });

export const useMarkAsRead = (clubId: string, conversationId: string) =>
  useMutation({
    mutationFn: () => markAsRead(clubId, conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatKeys.conversationList(clubId),
      });
      queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount(clubId),
      });
    },
  });
