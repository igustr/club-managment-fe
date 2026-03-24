import { TrainingSessionStatus } from './common.types';

export interface TrainingSessionDTO {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  teamId: string;
  teamName: string;
  pitchId: string | null;
  pitchName: string | null;
  pitchPortion: number;
  status: TrainingSessionStatus;
  notes: string | null;
  recurrenceGroupId: string | null;
}

export interface CreateTrainingSessionDTO {
  date: string;
  startTime: string;
  endTime: string;
  pitchId?: string;
  pitchPortion?: number;
  notes?: string;
}

export interface CreateRecurringTrainingDTO {
  startDate: string;
  endDate: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  pitchId?: string;
  pitchPortion?: number;
  notes?: string;
}

export interface UpdateTrainingSessionDTO {
  date: string;
  startTime: string;
  endTime: string;
  pitchId?: string;
  pitchPortion?: number;
  notes?: string;
  status?: TrainingSessionStatus;
}
