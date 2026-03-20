import { useMemo, useState } from 'react';
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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  CalendarMonth,
  AccessTime,
  Groups,
  LocationOn,
  Notes,
  Chat,
  HourglassEmpty,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { updateAttendance, useMyAttendances, attendanceKeys } from '@/api/attendance.api';
import { queryClient } from '@/api/query-client';
import { useConversations } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { ConversationType } from '@/types/chat.types';
import { useAuthStore } from '@/stores/authStore';
import { TrainingSessionStatus, AttendanceStatus } from '@/types/common.types';
import { formatDate, formatTime } from '@/utils/date';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

export function PlayerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const user = useAuthStore((s) => s.user);

  const { data: trainings } = useTrainings(clubId, true);
  const { data: teams } = useTeams(clubId, true);
  const { data: conversations } = useConversations(clubId);
  const { data: myAttendances } = useMyAttendances(clubId);
  const [updatingTrainingId, setUpdatingTrainingId] = useState<string | null>(null);

  // Build a map of trainingSessionId -> AttendanceStatus from server data
  const attendanceStatuses = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    myAttendances?.forEach((a) => {
      map[a.trainingSessionId] = a.status;
    });
    return map;
  }, [myAttendances]);

  const teamConversations = useMemo(
    () => (conversations ?? []).filter((c) => c.type === ConversationType.TEAM),
    [conversations],
  );
  const directConversations = useMemo(
    () => (conversations ?? []).filter((c) => c.type !== ConversationType.TEAM).slice(0, 3),
    [conversations],
  );
  const hasAnyConversations = teamConversations.length > 0 || directConversations.length > 0;

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

  const nextTraining = upcoming[0];

  // Pending trainings = upcoming where player hasn't confirmed/declined yet
  const pendingTrainings = useMemo(
    () => upcoming.filter((tr) => {
      const status = attendanceStatuses[tr.id];
      return !status || status === AttendanceStatus.PENDING;
    }).slice(1), // skip next (shown in hero)
    [upcoming, attendanceStatuses],
  );

  const myTeam = teams?.[0];

  const handleUpdateStatus = async (trainingId: string, status: AttendanceStatus) => {
    if (!user || !clubId) return;
    setUpdatingTrainingId(trainingId);
    try {
      await updateAttendance(clubId, trainingId, user.id, { status });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.myAll(clubId) });
      toast.success(t('attendance.updateSuccess'));
    } catch {
      // Error toast is already shown by the axios interceptor
    } finally {
      setUpdatingTrainingId(null);
    }
  };

  // Day name from date
  const getDayName = (dateStr: string) => {
    const day = dayjs(dateStr);
    const dayKey = day.format('dddd').toUpperCase();
    return t(`trainings.days.${dayKey}`, dayKey);
  };

  const getStatusChip = (trainingId: string) => {
    const status = attendanceStatuses[trainingId];
    if (!status || status === AttendanceStatus.PENDING) {
      return (
        <Chip
          icon={<HourglassEmpty />}
          label={t('dashboard.decisionPending')}
          size="small"
          color="warning"
          variant="outlined"
        />
      );
    }
    if (status === AttendanceStatus.CONFIRMED) {
      return (
        <Chip
          icon={<CheckCircle />}
          label={t('attendance.confirmed')}
          size="small"
          color="success"
          variant="outlined"
        />
      );
    }
    return (
      <Chip
        icon={<Cancel />}
        label={t('attendance.declined')}
        size="small"
        color="error"
        variant="outlined"
      />
    );
  };

  const nextTrainingStatus = nextTraining ? attendanceStatuses[nextTraining.id] : undefined;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {myTeam?.name ?? ''}
      </Typography>

      {/* ======================== */}
      {/* NEXT TRAINING HERO CARD */}
      {/* ======================== */}
      {nextTraining ? (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            fontWeight={600}
            sx={{ mb: 2, display: 'block' }}
          >
            {t('dashboard.nextTraining')}
          </Typography>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ md: 'flex-start' }}
          >
            {/* Date block */}
            <Box
              sx={{
                bgcolor: 'action.hover',
                borderRadius: 2,
                p: 2,
                textAlign: 'center',
                minWidth: 90,
              }}
            >
              <Typography variant="caption" color="text.secondary">
                {getDayName(nextTraining.date)}
              </Typography>
              <Typography variant="h3" fontWeight={700}>
                {dayjs(nextTraining.date).format('DD')}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(nextTraining.date).format('MMMM YYYY')}
              </Typography>
            </Box>

            {/* Details */}
            <Box sx={{ flex: 1 }}>
              <Stack spacing={1.2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <AccessTime sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    {t('trainings.time')}
                  </Typography>
                  <Typography variant="body2">
                    {formatTime(nextTraining.startTime)} – {formatTime(nextTraining.endTime)}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Groups sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    {t('trainings.team')}
                  </Typography>
                  <Typography variant="body2">{nextTraining.teamName}</Typography>
                </Stack>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <LocationOn sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                    {t('trainings.pitch')}
                  </Typography>
                  <Typography variant="body2">
                    {nextTraining.pitchName ?? '—'}
                  </Typography>
                </Stack>
                {nextTraining.notes && (
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <Notes sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ minWidth: 80 }}>
                      {t('trainings.notes')}
                    </Typography>
                    <Typography variant="body2">{nextTraining.notes}</Typography>
                  </Stack>
                )}
              </Stack>
            </Box>

            {/* Status + Actions */}
            <Stack spacing={1.5} alignItems="center" sx={{ minWidth: 180 }}>
              {nextTrainingStatus === AttendanceStatus.CONFIRMED ? (
                <>
                  <Chip
                    icon={<CheckCircle />}
                    label={t('attendance.confirmed')}
                    color="success"
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    fullWidth
                    startIcon={<Cancel />}
                    onClick={() => handleUpdateStatus(nextTraining.id, AttendanceStatus.DECLINED)}
                    disabled={updatingTrainingId === nextTraining.id}
                  >
                    {t('attendance.decline')}
                  </Button>
                </>
              ) : nextTrainingStatus === AttendanceStatus.DECLINED ? (
                <>
                  <Chip
                    icon={<Cancel />}
                    label={t('attendance.declined')}
                    color="error"
                    variant="outlined"
                  />
                  <Button
                    size="small"
                    color="success"
                    variant="outlined"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => handleUpdateStatus(nextTraining.id, AttendanceStatus.CONFIRMED)}
                    disabled={updatingTrainingId === nextTraining.id}
                  >
                    {t('attendance.confirm')}
                  </Button>
                </>
              ) : (
                <>
                  <Chip
                    label={t('dashboard.decisionPending')}
                    color="warning"
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    startIcon={<CheckCircle />}
                    onClick={() => handleUpdateStatus(nextTraining.id, AttendanceStatus.CONFIRMED)}
                    disabled={updatingTrainingId === nextTraining.id}
                  >
                    {t('attendance.confirm')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<Cancel />}
                    onClick={() => handleUpdateStatus(nextTraining.id, AttendanceStatus.DECLINED)}
                    disabled={updatingTrainingId === nextTraining.id}
                  >
                    {t('attendance.decline')}
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Paper>
      ) : (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <CalendarMonth sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {t('dashboard.noUpcoming')}
          </Typography>
        </Paper>
      )}

      {/* ============================ */}
      {/* PENDING DECISIONS — batch     */}
      {/* ============================ */}
      {pendingTrainings.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('dashboard.pendingDecisions')} ({pendingTrainings.length})
          </Typography>
          <Stack
            direction="row"
            sx={{
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {pendingTrainings.slice(0, 6).map((tr) => (
              <Paper
                key={tr.id}
                variant="outlined"
                sx={{
                  p: 2.5,
                  flex: '1 1 280px',
                  maxWidth: { md: 'calc(33.333% - 11px)' },
                }}
              >
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {getDayName(tr.date)}, {formatDate(tr.date)}
                </Typography>
                <Stack spacing={0.5} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    <AccessTime sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                    {formatTime(tr.startTime)} – {formatTime(tr.endTime)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    <LocationOn sx={{ fontSize: 14, verticalAlign: 'text-bottom', mr: 0.5 }} />
                    {tr.pitchName ?? '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="contained"
                    color="success"
                    fullWidth
                    sx={{ fontSize: 12 }}
                    onClick={() => handleUpdateStatus(tr.id, AttendanceStatus.CONFIRMED)}
                    disabled={updatingTrainingId === tr.id}
                  >
                    {t('attendance.confirm')}
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    fullWidth
                    sx={{ fontSize: 12 }}
                    onClick={() => handleUpdateStatus(tr.id, AttendanceStatus.DECLINED)}
                    disabled={updatingTrainingId === tr.id}
                  >
                    {t('attendance.decline')}
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Box>
      )}

      {/* ========================== */}
      {/* TWO COLUMNS: Team + Chat   */}
      {/* ========================== */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        {/* My team card */}
        {myTeam && (
          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
              {t('dashboard.myTeam')}
            </Typography>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, cursor: 'pointer', '&:hover': { borderColor: 'primary.main' } }}
              onClick={() => navigate(`/teams/${myTeam.id}`)}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {myTeam.name}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ my: 1 }}>
                    {myTeam.ageGroup && (
                      <Chip label={myTeam.ageGroup} size="small" variant="outlined" />
                    )}
                    {myTeam.season && (
                      <Chip label={myTeam.season} size="small" variant="outlined" />
                    )}
                  </Stack>
                </Box>
                <Chip
                  label={t('teams.memberCount', { count: myTeam.memberCount })}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {upcoming.length} {t('dashboard.planned')}
              </Typography>
            </Paper>
          </Box>
        )}

        {/* Messages — same style as coach dashboard */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('dashboard.messages')}
          </Typography>
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
                      <Groups sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={600}>
                          {conv.name}
                        </Typography>
                        {conv.lastMessageText && (
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
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

                {/* Separator */}
                {teamConversations.length > 0 && directConversations.length > 0 && (
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
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontSize: 11 }}
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
                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
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

      {/* ========================= */}
      {/* UPCOMING TRAININGS TABLE  */}
      {/* ========================= */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {t('dashboard.allUpcoming')}
      </Typography>
      {upcoming.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <CalendarMonth sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
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
                <TableCell>{t('dashboard.myStatus')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {upcoming.slice(0, 10).map((tr) => (
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
                    <Chip label={tr.teamName} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{tr.pitchName ?? '—'}</TableCell>
                  <TableCell>{getStatusChip(tr.id)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
