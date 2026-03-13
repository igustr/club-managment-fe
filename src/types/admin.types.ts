import { ClubRole } from './common.types';

export interface CreateClubDTO {
  name: string;
  registrationCode?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

export interface AdminCreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
}

export interface AssignAdminDTO {
  userId: string;
}

export interface AddUserToClubDTO {
  userId: string;
  role: ClubRole;
}
