export interface ClubDTO {
  id: string;
  name: string;
  registrationCode: string | null;
  address: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

export interface UpdateClubDTO {
  name: string;
  registrationCode?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}
