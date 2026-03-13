import { AttendanceStatus, ClubRole } from './common.types';

export interface AttendanceDTO {
  id: string;
  trainingSessionId: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ClubRole;
  status: AttendanceStatus;
}

export interface AttendanceSummaryDTO {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  attendances: AttendanceDTO[];
}

export interface UpdateAttendanceDTO {
  status: AttendanceStatus;
}
