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
  Avatar,
  LinearProgress,
  CircularProgress,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  CalendarMonth,
  AccessTime,
  LocationOn,
  Groups,
  Chat,
  Person,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { useChildren } from '@/api/user.api';
import { useTrainings } from '@/api/training.api';
import {
  updateAttendance,
  useMyAttendances,
  attendanceKeys,
} from '@/api/attendance.api';
import { usePlayerStatistics } from '@/api/statistics.api';
import { queryClient } from '@/api/query-client';
import { useConversations } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import { ConversationType } from '@/types/chat.types';
import {
  TrainingSessionStatus,
  AttendanceStatus,
} from '@/types/common.types';
import { formatDate, formatTime } from '@/utils/date';
import type { UserDTO } from '@/types/auth.types';
import type { TrainingSessionDTO } from '@/types/training.types';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const MAX_TRAININGS = 3;

function ChildCard({
  child,
  clubId,
  trainings,
  attendanceMap,
  onUpdateAttendance,
  updatingId,
  defaultExpanded,
}: {
  child: UserDTO;
  clubId: string;
  trainings: TrainingSessionDTO[];
  attendanceMap: Record<string, AttendanceStatus>;
  onUpdateAttendance: (
    trainingId: string,
    childId: string,
    status: AttendanceStatus,
  ) => void;
  updatingId: string | null;
  defaultExpanded: boolean;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const { data: stats } = usePlayerStatistics(clubId, child.id);

  const childUpcoming = useMemo(() => {
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

  const pendingCount = childUpcoming.filter((tr) => {
    const s = attendanceMap[tr.id];
    return !s || s === AttendanceStatus.PENDING;
  }).length;

  const rateColor = (rate: number) =>
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  const rateBarColor = (rate: number): 'success' | 'warning' | 'error' =>
    rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'error';

  return (
    <Paper variant="outlined" sx={{ mb: 2 }}>
      {/* Clickable header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => setExpanded(!expanded)}
      >
        <IconButton size="small" sx={{ mr: 1 }}>
          {expanded ? (
            <ExpandMore fontSize="small" />
          ) : (
            <ChevronRight fontSize="small" />
          )}
        </IconButton>
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: 'primary.main',
            fontWeight: 600,
            mr: 1.5,
          }}
        >
          {child.firstName.charAt(0)}
          {child.lastName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="subtitle1" fontWeight={700}>
            {child.firstName} {child.lastName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {child.position && (
              <Chip
                label={t(`positions.${child.position}`)}
                size="small"
                variant="outlined"
                sx={{ height: 20, fontSize: 11 }}
              />
            )}
            {stats && (
              <Typography variant="caption" color={rateColor(stats.attendanceRate)}>
                {t('statistics.attendanceRate')}: {stats.attendanceRate}%
              </Typography>
            )}
          </Stack>
        </Box>
        {pendingCount > 0 && (
          <Chip
            label={`${pendingCount} ${t('dashboard.pendingShort')}`}
            size="small"
            color="warning"
            variant="outlined"
            sx={{ mr: 1 }}
          />
        )}
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2.5, pb: 2.5 }}>
          {/* Statistics */}
          {stats && stats.totalTrainings > 0 && (
            <Paper
              variant="outlined"
              sx={{ p: 2, mb: 2, bgcolor: 'action.hover' }}
            >
              <Stack
                direction="row"
                spacing={3}
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('statistics.totalTrainings')}
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {stats.totalTrainings}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('statistics.attendanceRate')}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={rateColor(stats.attendanceRate)}
                  >
                    {stats.attendanceRate}%
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('dashboard.confirmedShort')}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="success.main">
                    {stats.confirmedCount}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    {t('dashboard.declinedShort')}
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="error.main">
                    {stats.declinedCount}
                  </Typography>
                </Box>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={stats.attendanceRate}
                color={rateBarColor(stats.attendanceRate)}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Paper>
          )}

          {/* Upcoming trainings */}
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('dashboard.upcomingTrainings')}
          </Typography>
          {childUpcoming.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <CalendarMonth
                sx={{ fontSize: 28, color: 'text.disabled', mb: 0.5 }}
              />
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noUpcoming')}
              </Typography>
            </Box>
          ) : (
            <>
              <Stack spacing={1}>
                {childUpcoming.slice(0, MAX_TRAININGS).map((tr) => {
                  const status = attendanceMap[tr.id];
                  const isPending =
                    !status || status === AttendanceStatus.PENDING;
                  const isConfirmed = status === AttendanceStatus.CONFIRMED;
                  const isDeclined = status === AttendanceStatus.DECLINED;
                  const isUpdating = updatingId === `${tr.id}-${child.id}`;

                  return (
                    <Paper key={tr.id} variant="outlined" sx={{ p: 2 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={2}
                        alignItems={{ sm: 'center' }}
                      >
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={600}>
                            {formatDate(tr.date)}
                          </Typography>
                          <Stack direction="row" spacing={2} sx={{ mt: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                              <AccessTime
                                sx={{
                                  fontSize: 13,
                                  verticalAlign: 'text-bottom',
                                  mr: 0.3,
                                }}
                              />
                              {formatTime(tr.startTime)} –{' '}
                              {formatTime(tr.endTime)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              <LocationOn
                                sx={{
                                  fontSize: 13,
                                  verticalAlign: 'text-bottom',
                                  mr: 0.3,
                                }}
                              />
                              {tr.pitchName ?? '—'}
                            </Typography>
                          </Stack>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {isConfirmed && (
                            <>
                              <Chip
                                icon={<CheckCircle />}
                                label={t('attendance.confirmed')}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                sx={{ fontSize: 12, minWidth: 0 }}
                                onClick={() =>
                                  onUpdateAttendance(
                                    tr.id,
                                    child.id,
                                    AttendanceStatus.DECLINED,
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <Cancel fontSize="small" />
                              </Button>
                            </>
                          )}
                          {isDeclined && (
                            <>
                              <Chip
                                icon={<Cancel />}
                                label={t('attendance.declined')}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                              <Button
                                size="small"
                                color="success"
                                variant="outlined"
                                sx={{ fontSize: 12, minWidth: 0 }}
                                onClick={() =>
                                  onUpdateAttendance(
                                    tr.id,
                                    child.id,
                                    AttendanceStatus.CONFIRMED,
                                  )
                                }
                                disabled={isUpdating}
                              >
                                <CheckCircle fontSize="small" />
                              </Button>
                            </>
                          )}
                          {isPending && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircle />}
                                sx={{ fontSize: 12 }}
                                onClick={() =>
                                  onUpdateAttendance(
                                    tr.id,
                                    child.id,
                                    AttendanceStatus.CONFIRMED,
                                  )
                                }
                                disabled={isUpdating}
                              >
                                {t('attendance.confirm')}
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<Cancel />}
                                sx={{ fontSize: 12 }}
                                onClick={() =>
                                  onUpdateAttendance(
                                    tr.id,
                                    child.id,
                                    AttendanceStatus.DECLINED,
                                  )
                                }
                                disabled={isUpdating}
                              >
                                {t('attendance.decline')}
                              </Button>
                            </>
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  );
                })}
              </Stack>
              {childUpcoming.length > MAX_TRAININGS && (
                <Button
                  size="small"
                  sx={{ mt: 1 }}
                  onClick={() => navigate('/trainings')}
                >
                  {t('dashboard.viewAll')} ({childUpcoming.length})
                </Button>
              )}
            </>
          )}

          <Button
            size="small"
            sx={{ mt: 1.5 }}
            onClick={() => navigate(`/members/${child.id}`)}
          >
            {t('dashboard.viewProfile')}
          </Button>
        </Box>
      </Collapse>
    </Paper>
  );
}

export function ParentDashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const user = useAuthStore((s) => s.user);

  const { data: children, isLoading: childrenLoading } = useChildren(
    clubId,
    user?.id,
  );
  const { data: trainings } = useTrainings(clubId, true);
  const { data: myAttendances } = useMyAttendances(clubId);
  const { data: conversations } = useConversations(clubId);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    myAttendances?.forEach((a) => {
      map[a.trainingSessionId] = a.status;
    });
    return map;
  }, [myAttendances]);

  const teamConversations = useMemo(
    () =>
      (conversations ?? []).filter((c) => c.type === ConversationType.TEAM),
    [conversations],
  );
  const directConversations = useMemo(
    () =>
      (conversations ?? [])
        .filter((c) => c.type !== ConversationType.TEAM)
        .slice(0, 3),
    [conversations],
  );
  const hasAnyConversations =
    teamConversations.length > 0 || directConversations.length > 0;

  const handleUpdateAttendance = async (
    trainingId: string,
    childId: string,
    status: AttendanceStatus,
  ) => {
    if (!clubId) return;
    setUpdatingId(`${trainingId}-${childId}`);
    try {
      await updateAttendance(clubId, trainingId, childId, { status });
      queryClient.invalidateQueries({
        queryKey: attendanceKeys.myAll(clubId),
      });
      toast.success(t('attendance.updateSuccess'));
    } catch {
      // Error handled by axios interceptor
    } finally {
      setUpdatingId(null);
    }
  };

  if (childrenLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('dashboard.parentSubtitle')}
      </Typography>

      {(!children || children.length === 0) && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', mb: 3 }}>
          <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {t('dashboard.noChildren')}
          </Typography>
        </Paper>
      )}

      {children?.map((child, idx) => (
        <ChildCard
          key={child.id}
          child={child}
          clubId={clubId!}
          trainings={trainings ?? []}
          attendanceMap={attendanceMap}
          onUpdateAttendance={handleUpdateAttendance}
          updatingId={updatingId}
          defaultExpanded={idx === 0}
        />
      ))}

      {/* Messages */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5, mt: 1 }}>
        {t('dashboard.messages')}
      </Typography>
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
  );
}
