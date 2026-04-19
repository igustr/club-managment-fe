import { TrainingSessionStatus } from './common.types';

export interface TrainingSessionDTO {
  id: string;
  date: string;
  gatheringTime: string | null;
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
  gatheringTime?: string;
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
  gatheringTime?: string;
  startTime: string;
  endTime: string;
  pitchId?: string;
  pitchPortion?: number;
  notes?: string;
}

export interface UpdateTrainingSessionDTO {
  date: string;
  gatheringTime?: string;
  startTime: string;
  endTime: string;
  pitchId?: string;
  pitchPortion?: number;
  notes?: string;
  status?: TrainingSessionStatus;
}
