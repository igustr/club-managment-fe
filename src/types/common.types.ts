export enum ClubRole {
  CLUB_ADMIN = 'CLUB_ADMIN',
  COACH = 'COACH',
  PLAYER = 'PLAYER',
  PARENT = 'PARENT',
}

export enum SystemRole {
  MASTER_ADMIN = 'MASTER_ADMIN',
}

export enum AttendanceStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  DECLINED = 'DECLINED',
}

export enum TrainingSessionStatus {
  SCHEDULED = 'SCHEDULED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface ApiError {
  status: number;
  message: string;
  timestamp?: string;
}
