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

export enum PlayerPosition {
  GOALKEEPER = 'GOALKEEPER',
  DEFENDER = 'DEFENDER',
  MIDFIELDER = 'MIDFIELDER',
  STRIKER = 'STRIKER',
}

export enum SurfaceType {
  NATURAL_GRASS = 'NATURAL_GRASS',
  ARTIFICIAL_TURF = 'ARTIFICIAL_TURF',
  INDOOR = 'INDOOR',
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
