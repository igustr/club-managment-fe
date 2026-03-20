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
  Add,
  Repeat,
  BarChart,
  CalendarMonth,
  Chat,
  Groups as GroupsIcon,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { useTeamStatistics } from '@/api/statistics.api';
import { useAttendanceSummary } from '@/api/attendance.api';
import { useConversations } from '@/api/chat.api';
import { useClub } from '@/api/club.api';
import { useClubId } from '@/hooks/useClubId';
import { TrainingSessionStatus } from '@/types/common.types';
import { ConversationType } from '@/types/chat.types';
import { formatDate, formatTime } from '@/utils/date';
import dayjs from 'dayjs';

export function CoachDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { data: club } = useClub(clubId);
  const { data: teams } = useTeams(clubId, true);
  const { data: trainings } = useTrainings(clubId, true);
  const { data: conversations } = useConversations(clubId);

  // Get stats for first team (coach usually has 1-2 teams)
  const firstTeam = teams?.[0];
  const secondTeam = teams?.[1];
  const { data: firstTeamStats } = useTeamStatistics(clubId, firstTeam?.id);
  const { data: secondTeamStats } = useTeamStatistics(clubId, secondTeam?.id);

  // Upcoming scheduled trainings
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
      });
  }, [trainings]);

  // Next training per team
  const nextTrainingForTeam = (teamId: string) => {
    return upcoming.find((tr) => tr.teamId === teamId);
  };

  // Attendance summaries for next training of each team
  const firstTeamNext = firstTeam ? nextTrainingForTeam(firstTeam.id) : undefined;
  const secondTeamNext = secondTeam ? nextTrainingForTeam(secondTeam.id) : undefined;
  const { data: firstNextAttendance } = useAttendanceSummary(
    firstTeamNext ? clubId : null,
    firstTeamNext?.id,
  );
  const { data: secondNextAttendance } = useAttendanceSummary(
    secondTeamNext ? clubId : null,
    secondTeamNext?.id,
  );

  // Team conversations
  const teamConversations = useMemo(
    () => (conversations ?? []).filter((c) => c.type === ConversationType.TEAM),
    [conversations],
  );

  // Direct conversations (last 3)
  const directConversations = useMemo(
    () =>
      (conversations ?? [])
        .filter((c) => c.type !== ConversationType.TEAM)
        .slice(0, 3),
    [conversations],
  );

  const hasAnyConversations =
    teamConversations.length > 0 || directConversations.length > 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {club?.name}
      </Typography>

      {/* QUICK ACTIONS */}
      <Stack direction="row" spacing={1.5} sx={{ mb: 3 }} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/trainings/create')}
        >
          {t('dashboard.addTraining')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<Repeat />}
          onClick={() => navigate('/trainings/create?recurring=true')}
        >
          {t('dashboard.addRecurring')}
        </Button>
        <Button
          variant="outlined"
          startIcon={<BarChart />}
          onClick={() => navigate('/statistics')}
        >
          {t('dashboard.viewStatistics')}
        </Button>
      </Stack>

      {/* MY TEAMS */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {t('dashboard.myTeams')}
      </Typography>
      {!teams || teams.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography color="text.secondary">{t('dashboard.noTeams')}</Typography>
        </Paper>
      ) : (
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          {teams.map((team) => {
            const next = nextTrainingForTeam(team.id);
            const stats =
              team.id === firstTeam?.id ? firstTeamStats : secondTeamStats;
            const nextAttendance =
              team.id === firstTeam?.id ? firstNextAttendance : secondNextAttendance;
            return (
              <Paper
                key={team.id}
                variant="outlined"
                sx={{
                  flex: 1,
                  p: 2.5,
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.main' },
                }}
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  sx={{ mb: 1 }}
                >
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {team.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                      {team.ageGroup && (
                        <Chip
                          label={team.ageGroup}
                          size="small"
                          variant="outlined"
                        />
                      )}
                      {team.season && (
                        <Chip
                          label={team.season}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Stack>
                  </Box>
                  <Chip
                    label={t('teams.memberCount', { count: team.memberCount })}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Stack>

                {/* Next training info + attendance */}
                {next && (
                  <Box
                    sx={{
                      bgcolor: 'action.hover',
                      borderRadius: 1.5,
                      p: 1.5,
                      mt: 1.5,
                    }}
                  >
                    <Typography
                      variant="overline"
                      color="text.secondary"
                      sx={{ fontSize: 10 }}
                    >
                      {t('dashboard.nextTrainingLabel')}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                      {formatDate(next.date)} · {formatTime(next.startTime)} –{' '}
                      {formatTime(next.endTime)} · {next.pitchName ?? '—'}
                    </Typography>

                    {/* Attendance counts for next training */}
                    {nextAttendance && (
                      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            {nextAttendance.confirmed} {t('dashboard.confirmedShort')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'error.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            {nextAttendance.declined} {t('dashboard.declinedShort')}
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
                          <Typography variant="caption" color="text.secondary">
                            {nextAttendance.pending} {t('dashboard.pendingShort')}
                          </Typography>
                        </Stack>
                      </Stack>
                    )}
                  </Box>
                )}

                {/* Attendance rate bar */}
                {stats && (
                  <Box sx={{ mt: 1.5 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {t('dashboard.averageAttendance')}
                      </Typography>
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color={
                          stats.averageAttendanceRate >= 75
                            ? 'success.main'
                            : stats.averageAttendanceRate >= 50
                              ? 'warning.main'
                              : 'error.main'
                        }
                      >
                        {Math.round(stats.averageAttendanceRate)}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={stats.averageAttendanceRate}
                      color={
                        stats.averageAttendanceRate >= 75
                          ? 'success'
                          : stats.averageAttendanceRate >= 50
                            ? 'warning'
                            : 'error'
                      }
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                  </Box>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}

      {/* TWO COLUMN: TRAININGS + RIGHT SIDEBAR */}
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
        {/* UPCOMING TRAININGS */}
        <Box sx={{ flex: 1.5 }}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle1" fontWeight={600}>
              {t('dashboard.upcomingTrainingsCoach')}
            </Typography>
            <Button
              size="small"
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/trainings/create')}
            >
              {t('dashboard.addTraining')}
            </Button>
          </Stack>
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
                  {upcoming.slice(0, 7).map((tr) => (
                    <TableRow
                      key={tr.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/trainings/${tr.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatDate(tr.date)}
                      </TableCell>
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
                          label={t('trainings.statusScheduled')}
                          size="small"
                          color="primary"
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

        {/* RIGHT COLUMN: Messages */}
        <Box sx={{ flex: 1, minWidth: 280 }}>
          {/* Combined messages card: team chats + direct messages */}
          <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ p: 2, pb: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
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
                {/* Team conversations */}
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
                      <GroupsIcon
                        sx={{ fontSize: 20, color: 'primary.main' }}
                      />
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

                {/* Separator between team and direct */}
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

                {/* Direct conversations */}
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
