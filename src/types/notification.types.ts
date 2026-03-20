export enum NotificationType {
  TRAINING_UPDATED = 'TRAINING_UPDATED',
  TRAINING_CANCELLED = 'TRAINING_CANCELLED',
  TRAINING_DELETED = 'TRAINING_DELETED',
  MESSAGE = 'MESSAGE',
}

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  referenceId: string | null;
  read: boolean;
  createdAt: string;
}
