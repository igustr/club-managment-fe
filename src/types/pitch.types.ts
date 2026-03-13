export interface PitchDTO {
  id: string;
  name: string;
  address: string | null;
  surfaceType: string | null;
  capacity: number | null;
  clubId: string;
}

export interface CreatePitchDTO {
  name: string;
  address?: string;
  surfaceType?: string;
  capacity?: number;
}

export interface UpdatePitchDTO {
  name: string;
  address?: string;
  surfaceType?: string;
  capacity?: number;
}
