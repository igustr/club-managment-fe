import { TournamentStatus } from './common.types';

export interface TournamentDTO {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  pitchId: string | null;
  pitchName: string | null;
  venueName: string | null;
  venueAddress: string | null;
  status: TournamentStatus;
  notes: string | null;
  teamId: string;
  teamName: string;
}

export interface CreateTournamentDTO {
  name: string;
  startDate: string;
  endDate: string;
  pitchId?: string;
  venueName?: string;
  venueAddress?: string;
  notes?: string;
}

export interface UpdateTournamentDTO {
  name: string;
  startDate: string;
  endDate: string;
  pitchId?: string;
  venueName?: string;
  venueAddress?: string;
  notes?: string;
}
