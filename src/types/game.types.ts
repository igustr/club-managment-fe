import { GameStatus, VenueType } from './common.types';

export interface GameDTO {
  id: string;
  date: string;
  gatheringTime: string | null;
  startTime: string;
  endTime: string;
  opponent: string;
  venueType: VenueType;
  pitchId: string | null;
  pitchName: string | null;
  venueName: string | null;
  venueAddress: string | null;
  status: GameStatus;
  notes: string | null;
  teamId: string;
  teamName: string;
}

export interface CreateGameDTO {
  date: string;
  gatheringTime?: string;
  startTime: string;
  endTime: string;
  opponent: string;
  venueType: VenueType;
  pitchId?: string;
  venueName?: string;
  venueAddress?: string;
  notes?: string;
}

export interface UpdateGameDTO {
  date: string;
  gatheringTime?: string;
  startTime: string;
  endTime: string;
  opponent: string;
  venueType: VenueType;
  pitchId?: string;
  venueName?: string;
  venueAddress?: string;
  notes?: string;
}
