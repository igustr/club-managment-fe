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
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  CalendarMonth,
  AccessTime,
  Groups,
  LocationOn,
  Notes,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { usePlayerStatistics } from '@/api/statistics.api';
import { useAttendanceList, useUpdateAttendance } from '@/api/attendance.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import { TrainingSessionStatus, AttendanceStatus } from '@/types/common.types';
import { formatDate, formatTime } from '@/utils/date';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';
import dayjs from 'dayjs';

export function PlayerDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const user = useAuthStore((s) => s.user);

  const { data: trainings } = useTrainings(clubId, true);
  const { data: teams } = useTeams(clubId, true);
  const { data: playerStats } = usePlayerStatistics(clubId, user?.id);

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

  // Fetch attendance for the next training to show status + actions
  const { data: nextAttendanceList } = useAttendanceList(
    nextTraining ? clubId : null,
    nextTraining?.id,
  );
  const updateMutation = useUpdateAttendance(
    clubId!,
    nextTraining?.id ?? '',
  );

  const myAttendance = nextAttendanceList?.find(
    (a) => a.userId === user?.id,
  );
  const myStatus = myAttendance?.status ?? AttendanceStatus.PENDING;

  const handleUpdateStatus = async (status: AttendanceStatus) => {
    if (!user || !nextTraining) return;
    try {
      await updateMutation.mutateAsync({
        userId: user.id,
        data: { status },
      });
      toast.success(t('attendance.updateSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const myTeam = teams?.[0];

  // Day name from date
  const getDayName = (dateStr: string) => {
    const day = dayjs(dateStr);
    const dayKey = day.format('dddd').toUpperCase();
    return t(`trainings.days.${dayKey}`, dayKey);
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {myTeam?.name ?? ''}
      </Typography>

      {/* NEXT TRAINING HERO */}
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
            <Stack spacing={1.5} alignItems="center" sx={{ minWidth: 160 }}>
              {myStatus === AttendanceStatus.CONFIRMED ? (
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
                    onClick={() => handleUpdateStatus(AttendanceStatus.DECLINED)}
                    disabled={updateMutation.isPending}
                  >
                    {t('attendance.decline')}
                  </Button>
                </>
              ) : myStatus === AttendanceStatus.DECLINED ? (
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
                    onClick={() => handleUpdateStatus(AttendanceStatus.CONFIRMED)}
                    disabled={updateMutation.isPending}
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
                    onClick={() => handleUpdateStatus(AttendanceStatus.CONFIRMED)}
                    disabled={updateMutation.isPending}
                  >
                    {t('attendance.confirm')}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    fullWidth
                    startIcon={<Cancel />}
                    onClick={() => handleUpdateStatus(AttendanceStatus.DECLINED)}
                    disabled={updateMutation.isPending}
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

      {/* STATS + TEAM INFO */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 3 }}>
        {/* Attendance stats */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('dashboard.myAttendanceStats')}
          </Typography>
          <Stack direction="row" spacing={2}>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2.5, textAlign: 'center' }}
            >
              <Typography variant="h4" fontWeight={700} color="success.main">
                {playerStats?.confirmedCount ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.confirmed')}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2.5, textAlign: 'center' }}
            >
              <Typography variant="h4" fontWeight={700} color="error.main">
                {playerStats?.declinedCount ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.declined')}
              </Typography>
            </Paper>
            <Paper
              variant="outlined"
              sx={{ flex: 1, p: 2.5, textAlign: 'center' }}
            >
              <Typography variant="h4" fontWeight={700} color="warning.main">
                {playerStats?.pendingCount ?? 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('attendance.pending')}
              </Typography>
            </Paper>
          </Stack>
        </Box>

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
              <Typography variant="body2" color="text.secondary">
                {t('teams.memberCount', { count: myTeam.memberCount })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {upcoming.length} {t('dashboard.planned')}
              </Typography>
            </Paper>
          </Box>
        )}
      </Stack>

      {/* UPCOMING TRAININGS TABLE */}
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
                <TableCell>{t('trainings.status')}</TableCell>
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
  );
}
