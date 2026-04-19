import { ClubRole, PlayerPosition, SystemRole } from './common.types';

export interface UserDTO {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  photoUrl: string | null;
  position: PlayerPosition | null;
  role: ClubRole | null;
  systemRole: SystemRole | null;
  clubId: string | null;
  clubName: string | null;
  active: boolean;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface RegisterRequestDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
}

export interface AuthResponseDTO {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshTokenRequestDTO {
  refreshToken: string;
}
