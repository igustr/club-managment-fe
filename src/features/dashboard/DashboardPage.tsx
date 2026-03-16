import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Groups,
  Person,
  FitnessCenter,
  SportsSoccer,
  CalendarMonth,
} from '@mui/icons-material';
import { useClubUsers } from '@/api/user.api';
import { useClub } from '@/api/club.api';
import { useTeams } from '@/api/team.api';
import { useTrainings } from '@/api/training.api';
import { usePitches } from '@/api/pitch.api';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';
import { TrainingSessionStatus } from '@/types/common.types';
import { formatDate, formatTime } from '@/utils/date';
import dayjs from 'dayjs';

function StatCard({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        flex: 1,
        minWidth: 200,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? { borderColor: 'primary.main', bgcolor: 'action.hover' }
          : {},
      }}
      onClick={onClick}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            p: 1,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

const statusColors: Record<
  TrainingSessionStatus,
  'primary' | 'error' | 'success'
> = {
  [TrainingSessionStatus.SCHEDULED]: 'primary',
  [TrainingSessionStatus.CANCELLED]: 'error',
  [TrainingSessionStatus.COMPLETED]: 'success',
};

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { isClubAdmin } = usePermissions();
  const { data: club } = useClub(clubId);
  const { data: usersPage } = useClubUsers(clubId, { page: 0, size: 1 });
  const { data: teams } = useTeams(clubId);
  const { data: trainings } = useTrainings(clubId);
  const { data: pitches } = usePitches(clubId);

  const memberCount = usersPage?.totalElements ?? 0;
  const teamCount = teams?.length ?? 0;
  const pitchCount = pitches?.length ?? 0;
  const trainingCount = trainings?.length ?? 0;

  // Upcoming trainings: scheduled, today or future, sorted by date+time, max 7
  const upcoming = useMemo(() => {
    if (!trainings) return [];
    const today = dayjs().format('YYYY-MM-DD');
    return trainings
      .filter(
        (tr) =>
          tr.status === TrainingSessionStatus.SCHEDULED && tr.date >= today,
      )
      .sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 7);
  }, [trainings]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        {t('nav.dashboard')}
      </Typography>
      {club && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {club.name}
        </Typography>
      )}

      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <StatCard
          title={t('dashboard.members')}
          value={memberCount}
          icon={<Person />}
          onClick={isClubAdmin ? () => navigate('/users') : undefined}
        />
        <StatCard
          title={t('dashboard.teams')}
          value={teamCount}
          icon={<Groups />}
          onClick={() => navigate('/teams')}
        />
        <StatCard
          title={t('dashboard.trainings')}
          value={trainingCount}
          icon={<FitnessCenter />}
          onClick={() => navigate('/trainings')}
        />
        <StatCard
          title={t('dashboard.pitches')}
          value={pitchCount}
          icon={<SportsSoccer />}
          onClick={() => navigate('/pitches')}
        />
      </Stack>

      {/* Upcoming trainings */}
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        {t('dashboard.upcomingTrainings')}
      </Typography>
      {upcoming.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <CalendarMonth
            sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            {t('dashboard.noUpcoming')}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('trainings.date')}</TableCell>
                <TableCell>{t('trainings.time')}</TableCell>
                <TableCell>{t('trainings.team')}</TableCell>
                <TableCell>{t('trainings.pitch')}</TableCell>
                <TableCell>{t('trainings.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcoming.map((tr) => (
                <TableRow
                  key={tr.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/trainings/${tr.id}`)}
                >
                  <TableCell>{formatDate(tr.date)}</TableCell>
                  <TableCell>
                    {formatTime(tr.startTime)} – {formatTime(tr.endTime)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tr.teamName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{tr.pitchName ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(
                        `trainings.status${tr.status.charAt(0) + tr.status.slice(1).toLowerCase()}`,
                      )}
                      size="small"
                      color={statusColors[tr.status]}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
