export enum ConversationType {
  DIRECT = 'DIRECT',
  TEAM = 'TEAM',
}

export interface ParticipantDTO {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ConversationDTO {
  id: string;
  type: ConversationType;
  name: string;
  teamId: string | null;
  lastMessageText: string | null;
  lastMessageTime: string | null;
  lastMessageSenderName: string | null;
  unreadCount: number;
  participants: ParticipantDTO[];
}

export interface MessageDTO {
  id: string;
  conversationId: string;
  senderId: string;
  senderFirstName: string;
  senderLastName: string;
  text: string;
  createdAt: string;
}

export interface SendMessageDTO {
  text: string;
}

export interface CreateDirectConversationDTO {
  participantId: string;
}
