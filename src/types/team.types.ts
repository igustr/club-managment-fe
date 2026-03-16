import type { ClubRole, PlayerPosition } from './common.types';

export interface TeamDTO {
  id: string;
  name: string;
  ageGroup: string | null;
  season: string | null;
  clubId: string;
  memberCount: number;
}

export interface CreateTeamDTO {
  name: string;
  ageGroup?: string;
  season?: string;
}

export interface UpdateTeamDTO {
  name: string;
  ageGroup?: string;
  season?: string;
}

export interface TeamMemberDTO {
  id: string;
  userId: string;
  teamId: string;
  firstName: string;
  lastName: string;
  email: string;
  position: PlayerPosition | null;
  role: ClubRole;
  joinedDate: string;
}

export interface AddTeamMemberDTO {
  userId: string;
}
