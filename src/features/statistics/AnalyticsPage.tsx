import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
} from '@mui/material';
import {
  People,
  Groups,
  FitnessCenter,
  TrendingUp,
} from '@mui/icons-material';
import { useClubId } from '@/hooks/useClubId';
import { useClubStatistics, useTeamStatistics } from '@/api/statistics.api';
import { StatCard } from './components/StatCard';
import { AttendanceRateCard } from './components/AttendanceRateCard';
import { TeamComparisonChart } from './components/TeamComparisonChart';
import { PlayerStatsTable } from './components/PlayerStatsTable';
import { MonthlyAttendanceChart } from './components/MonthlyAttendanceChart';

export function AnalyticsPage() {
  const { t } = useTranslation();
  const clubId = useClubId();
  const navigate = useNavigate();
  const [selectedTeamId, setSelectedTeamId] = useState<string>('');

  const { data: clubStats, isLoading } = useClubStatistics(clubId);
  const { data: teamStats } = useTeamStatistics(
    clubId,
    selectedTeamId || null,
  );

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!clubStats) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          {t('statistics.noData')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('statistics.title')}
      </Typography>

      {/* Overview cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
          mb: 4,
        }}
      >
        <StatCard
          title={t('statistics.totalMembers')}
          value={clubStats.totalMembers}
          icon={<People />}
          color="#0D9488"
        />
        <StatCard
          title={t('statistics.totalTeams')}
          value={clubStats.totalTeams}
          icon={<Groups />}
          color="#4F46E5"
        />
        <StatCard
          title={t('statistics.totalTrainings')}
          value={clubStats.totalTrainings}
          icon={<FitnessCenter />}
          color="#F59E0B"
        />
        <StatCard
          title={t('statistics.overallAttendance')}
          value={`${clubStats.overallAttendanceRate}%`}
          icon={<TrendingUp />}
          color="#22C55E"
        />
      </Box>

      {/* Club-level charts */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
          gap: 3,
          mb: 4,
        }}
      >
        <AttendanceRateCard
          title={t('statistics.overallAttendanceRate')}
          rate={clubStats.overallAttendanceRate}
        />
        <TeamComparisonChart
          title={t('statistics.teamComparison')}
          teams={clubStats.teamStatistics}
        />
      </Box>

      {/* Monthly trend */}
      {clubStats.monthlyAttendance.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <MonthlyAttendanceChart
            title={t('statistics.monthlyTrend')}
            data={clubStats.monthlyAttendance}
          />
        </Box>
      )}

      {/* Team drill-down */}
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 3 }}>
        <Typography variant="h6" fontWeight={600}>
          {t('statistics.teamDetails')}
        </Typography>
        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>{t('statistics.selectTeam')}</InputLabel>
          <Select
            value={selectedTeamId}
            onChange={(e) => setSelectedTeamId(e.target.value)}
            label={t('statistics.selectTeam')}
          >
            <MenuItem value="">
              <em>{t('statistics.selectTeamPlaceholder')}</em>
            </MenuItem>
            {clubStats.teamStatistics.map((team) => (
              <MenuItem key={team.teamId} value={team.teamId}>
                {team.teamName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {selectedTeamId && teamStats?.playerStatistics && (
        <PlayerStatsTable
          title={`${teamStats.teamName} — ${t('statistics.playerStatistics')}`}
          players={teamStats.playerStatistics}
          onProfileClick={(userId) => navigate(`/members/${userId}`)}
        />
      )}
    </Box>
  );
}
