import { ClubRole, PlayerPosition } from './common.types';

export interface AddUserToClubDTO {
  userId: string;
  role: ClubRole;
}

export interface UpdateUserDTO {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
  position?: PlayerPosition;
  role?: ClubRole;
  active?: boolean;
}

export interface LinkParentDTO {
  parentId: string;
}
