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

// Conflict view types
export type PitchEventType = 'TRAINING' | 'GAME';

export interface PitchScheduleEventDTO {
  id: string;
  eventType: PitchEventType;
  date: string;
  startTime: string;
  endTime: string;
  teamId: string;
  teamName: string;
  pitchPortion: number;
  label: string | null;
}

export interface PitchScheduleEntryDTO {
  pitchId: string;
  pitchName: string;
  events: PitchScheduleEventDTO[];
}

export interface PitchConflictDTO {
  pitchId: string;
  pitchName: string;
  date: string;
  overlapStart: string;
  overlapEnd: string;
  totalOccupancy: number;
  eventIds: string[];
}

export interface PitchScheduleDTO {
  from: string;
  to: string;
  pitches: PitchScheduleEntryDTO[];
  conflicts: PitchConflictDTO[];
}
