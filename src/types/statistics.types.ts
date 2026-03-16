export interface PlayerStatisticsDTO {
  userId: string;
  firstName: string;
  lastName: string;
  totalTrainings: number;
  confirmedCount: number;
  declinedCount: number;
  pendingCount: number;
  attendanceRate: number;
}

export interface TeamStatisticsDTO {
  teamId: string;
  teamName: string;
  memberCount: number;
  totalTrainings: number;
  averageAttendanceRate: number;
  playerStatistics?: PlayerStatisticsDTO[];
}

export interface MonthlyAttendanceDTO {
  month: string;
  totalTrainings: number;
  totalAttendances: number;
  confirmedCount: number;
  attendanceRate: number;
}

export interface ClubStatisticsDTO {
  totalMembers: number;
  totalTeams: number;
  totalTrainings: number;
  overallAttendanceRate: number;
  teamStatistics: TeamStatisticsDTO[];
  monthlyAttendance: MonthlyAttendanceDTO[];
}
