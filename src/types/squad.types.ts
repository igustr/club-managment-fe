import { AttendanceStatus, ClubRole, PlayerPosition } from './common.types';

export interface SquadMemberDTO {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: PlayerPosition | null;
  role: ClubRole;
  status: AttendanceStatus;
}

export interface AddSquadMembersDTO {
  userIds: string[];
}

export interface UpdateSquadMemberStatusDTO {
  status: AttendanceStatus;
}

export interface SquadSummaryDTO {
  total: number;
  confirmed: number;
  declined: number;
  pending: number;
  squadMembers: SquadMemberDTO[];
}
