import { TournamentStatus } from './common.types';

export interface TournamentDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: TournamentStatus;
  notes: string | null;
  teamId: string;
  teamName: string;
}

export interface CreateTournamentDTO {
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
}

export interface UpdateTournamentDTO {
  name: string;
  startDate: string;
  endDate: string;
  notes?: string;
}
