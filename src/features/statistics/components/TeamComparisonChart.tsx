import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import type { TeamStatisticsDTO } from '@/types/statistics.types';

interface TeamComparisonChartProps {
  title: string;
  teams: TeamStatisticsDTO[];
}

const TEAM_COLORS = [
  '#0D9488',
  '#4F46E5',
  '#F59E0B',
  '#EF4444',
  '#22C55E',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
];

export function TeamComparisonChart({ title, teams }: TeamComparisonChartProps) {
  if (teams.length === 0) return null;

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {teams.map((team, index) => (
          <Box key={team.teamId}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 0.5,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {team.teamName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {team.averageAttendanceRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={team.averageAttendanceRate}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: 'divider',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 5,
                  bgcolor: TEAM_COLORS[index % TEAM_COLORS.length],
                },
              }}
            />
          </Box>
        ))}
      </Box>
    </Paper>
  );
}
