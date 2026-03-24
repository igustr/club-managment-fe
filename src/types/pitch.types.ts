import { SurfaceType } from './common.types';
import type { TrainingSessionDTO } from './training.types';

export interface PitchDTO {
  id: string;
  name: string;
  address: string | null;
  surfaceType: SurfaceType | null;
  clubId: string;
}

export interface CreatePitchDTO {
  name: string;
  address?: string;
  surfaceType?: SurfaceType;
}

export interface UpdatePitchDTO {
  name: string;
  address?: string;
  surfaceType?: SurfaceType;
}

export interface PitchOccupancyDTO {
  pitchId: string;
  pitchName: string;
  date: string;
  totalOccupancy: number;
  sessions: TrainingSessionDTO[];
}
