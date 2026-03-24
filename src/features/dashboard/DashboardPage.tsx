import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Groups,
  Person,
  FitnessCenter,
  SportsSoccer,
  CalendarMonth,
  Add,
  PersonAdd,
  BarChart,
  Settings,
  Chat,
} from '@mui/icons-material';
import { useClubUsers } from '@/api/user.api';
import { useClub } from '@/api/club.api';
import { useTeams } from '@/api/team.api';
import { useTrainings } from '@/api/training.api';
import { usePitches } from '@/api/pitch.api';
import { useClubStatistics } from '@/api/statistics.api';
import { useConversations } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';
import { TrainingSessionStatus } from '@/types/common.types';
import { ConversationType } from '@/types/chat.types';
import { formatDate, formatTime } from '@/utils/date';
import { PlayerDashboard } from './components/PlayerDashboard';
import { CoachDashboard } from './components/CoachDashboard';
import { ParentDashboard } from './components/ParentDashboard';
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

function AdminDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { data: club } = useClub(clubId);
  const { data: usersPage } = useClubUsers(clubId, { page: 0, size: 1 });
  const { data: teams } = useTeams(clubId);
  const { data: trainings } = useTrainings(clubId);
  const { data: pitches } = usePitches(clubId);
  const { data: clubStats } = useClubStatistics(clubId);
  const { data: conversations } = useConversations(clubId);

  const memberCount = usersPage?.totalElements ?? 0;
  const teamCount = teams?.length ?? 0;
  const pitchCount = pitches?.length ?? 0;
  const trainingCount = trainings?.length ?? 0;

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

  const teamConversations = useMemo(
    () => (conversations ?? []).filter((c) => c.type === ConversationType.TEAM),
    [conversations],
  );
  const directConversations = useMemo(
    () => (conversations ?? []).filter((c) => c.type !== ConversationType.TEAM).slice(0, 3),
    [conversations],
  );
  const hasAnyConversations =
    teamConversations.length > 0 || directConversations.length > 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      {club && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {club.name}
        </Typography>
      )}

      {/* Quick actions */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<PersonAdd />}
          onClick={() => navigate('/users')}
        >
          {t('users.addUser')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Add />}
          onClick={() => navigate('/teams')}
        >
          {t('teams.createTeam')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<FitnessCenter />}
          onClick={() => navigate('/trainings/create')}
        >
          {t('trainings.createTraining')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<CalendarMonth />}
          onClick={() => navigate('/calendar')}
        >
          {t('nav.calendar')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<BarChart />}
          onClick={() => navigate('/statistics')}
        >
          {t('nav.statistics')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Settings />}
          onClick={() => navigate('/settings')}
        >
          {t('nav.settings')}
        </Button>
      </Stack>

      {/* Stat cards */}
      <Stack direction="row" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <StatCard
          title={t('dashboard.members')}
          value={memberCount}
          icon={<Person />}
          onClick={() => navigate('/users')}
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

      {/* Two-column: Upcoming trainings + right sidebar */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* Upcoming trainings */}
        <Box sx={{ flex: 1.5 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
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

        {/* Right column: Attendance + Messages */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          {/* Team attendance overview */}
          {clubStats && clubStats.teamStatistics.length > 0 && (
            <Paper variant="outlined" sx={{ p: 2.5, mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                {t('dashboard.attendanceOverview')}
              </Typography>
              {clubStats.teamStatistics.map((ts) => (
                <Stack
                  key={ts.teamId}
                  direction="row"
                  alignItems="center"
                  spacing={1.5}
                  sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}
                >
                  <Typography
                    variant="body2"
                    fontWeight={500}
                    sx={{ minWidth: 100 }}
                    noWrap
                  >
                    {ts.teamName}
                  </Typography>
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={ts.averageAttendanceRate}
                      color={
                        ts.averageAttendanceRate >= 75
                          ? 'success'
                          : ts.averageAttendanceRate >= 50
                            ? 'warning'
                            : 'error'
                      }
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{ minWidth: 40, textAlign: 'right' }}
                    color={
                      ts.averageAttendanceRate >= 75
                        ? 'success.main'
                        : ts.averageAttendanceRate >= 50
                          ? 'warning.main'
                          : 'error.main'
                    }
                  >
                    {Math.round(ts.averageAttendanceRate)}%
                  </Typography>
                </Stack>
              ))}
            </Paper>
          )}

          {/* Combined messages card */}
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{
                p: 2,
                pb: 1.5,
                borderBottom: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="subtitle2" fontWeight={600}>
                {t('dashboard.messages')}
              </Typography>
              <Button size="small" onClick={() => navigate('/chat')}>
                {t('dashboard.viewAll')}
              </Button>
            </Stack>
            {!hasAnyConversations ? (
              <Box sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {t('chat.noConversations')}
                </Typography>
              </Box>
            ) : (
              <>
                {teamConversations.map((conv) => (
                  <Box
                    key={conv.id}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Groups sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {conv.name}
                        </Typography>
                        {conv.lastMessageText && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block' }}
                          >
                            {conv.lastMessageText}
                          </Typography>
                        )}
                      </Box>
                      {conv.unreadCount > 0 && (
                        <Chip
                          label={conv.unreadCount}
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
                {teamConversations.length > 0 &&
                  directConversations.length > 0 && (
                    <Box
                      sx={{
                        px: 2,
                        py: 0.75,
                        bgcolor: 'action.hover',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          textTransform: 'uppercase',
                          letterSpacing: 0.5,
                          fontSize: 11,
                        }}
                      >
                        {t('dashboard.directMessages')}
                      </Typography>
                    </Box>
                  )}
                {directConversations.map((conv) => (
                  <Box
                    key={conv.id}
                    sx={{
                      px: 2,
                      py: 1.5,
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: 'action.hover' },
                      '&:last-child': { borderBottom: 'none' },
                    }}
                    onClick={() => navigate(`/chat/${conv.id}`)}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chat sx={{ fontSize: 20, color: 'secondary.main' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {conv.name}
                        </Typography>
                        {conv.lastMessageText && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                            sx={{ display: 'block' }}
                          >
                            {conv.lastMessageText}
                          </Typography>
                        )}
                      </Box>
                      {conv.unreadCount > 0 && (
                        <Chip
                          label={conv.unreadCount}
                          size="small"
                          color="primary"
                          sx={{ height: 20, fontSize: 11 }}
                        />
                      )}
                    </Stack>
                  </Box>
                ))}
              </>
            )}
          </Paper>
        </Box>
      </Stack>
    </Box>
  );
}

export function DashboardPage() {
  const { isPlayer, isParent, isCoach } = usePermissions();

  if (isParent) {
    return <ParentDashboard />;
  }

  if (isPlayer) {
    return <PlayerDashboard />;
  }

  if (isCoach) {
    return <CoachDashboard />;
  }

  return <AdminDashboard />;
}
