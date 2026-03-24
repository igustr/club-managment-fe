import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Paper,
  Chip,
  CircularProgress,
  Button,
  LinearProgress,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  FiberManualRecord,
  Warning,
} from '@mui/icons-material';
import { usePitch, usePitchSchedule } from '@/api/pitch.api';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { PITCH_PORTIONS } from '@/features/trainings/schemas';
import dayjs from 'dayjs';
import { TrainingSessionStatus } from '@/types/common.types';

export function PitchSchedulePage() {
  const { t } = useTranslation();
  const { pitchId } = useParams<{ pitchId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();

  const [weekOffset, setWeekOffset] = useState(0);
  const startDate = dayjs().startOf('week').add(weekOffset, 'week');
  const endDate = startDate.add(6, 'day');

  const { data: pitch, isLoading: pitchLoading } = usePitch(clubId, pitchId!);
  const { data: schedule, isLoading: scheduleLoading } = usePitchSchedule(
    clubId,
    pitchId!,
    startDate.format('YYYY-MM-DD'),
    endDate.format('YYYY-MM-DD'),
  );

  const days = Array.from({ length: 7 }, (_, i) => startDate.add(i, 'day'));

  const getStatusColor = (status: TrainingSessionStatus) => {
    switch (status) {
      case TrainingSessionStatus.SCHEDULED:
        return 'primary' as const;
      case TrainingSessionStatus.CANCELLED:
        return 'error' as const;
      case TrainingSessionStatus.COMPLETED:
        return 'success' as const;
      default:
        return 'action' as const;
    }
  };

  const getPortionLabel = (portion: number) =>
    PITCH_PORTIONS.find((p) => p.value === portion)?.label ?? `${portion}`;

  if (pitchLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pitch) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('error.notFound')}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/pitches')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {pitch.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pitches.schedule')}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Week navigation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          mb: 3,
        }}
      >
        <IconButton onClick={() => setWeekOffset((w) => w - 1)}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600}>
          {formatDate(startDate.toDate())} – {formatDate(endDate.toDate())}
        </Typography>
        <IconButton onClick={() => setWeekOffset((w) => w + 1)}>
          <ChevronRight />
        </IconButton>
        {weekOffset !== 0 && (
          <Button size="small" onClick={() => setWeekOffset(0)}>
            {t('pitches.today')}
          </Button>
        )}
      </Box>

      {/* Schedule grid */}
      {scheduleLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : (
        <Stack spacing={1}>
          {days.map((day) => {
            const dayStr = day.format('YYYY-MM-DD');
            const daySessions = (schedule ?? []).filter(
              (s) => s.date === dayStr,
            );
            const isToday = day.isSame(dayjs(), 'day');

            const scheduledSessions = daySessions.filter(
              (s) => s.status === TrainingSessionStatus.SCHEDULED,
            );
            const totalOccupancy = scheduledSessions.reduce(
              (sum, s) => sum + (s.pitchPortion ?? 1),
              0,
            );
            const occupancyPct = Math.round(totalOccupancy * 100);
            const isOverbooked = totalOccupancy > 1;

            return (
              <Paper
                key={dayStr}
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: isToday ? 'primary.50' : undefined,
                  borderColor: isOverbooked
                    ? 'warning.main'
                    : isToday
                      ? 'primary.main'
                      : undefined,
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: daySessions.length > 0 ? 1 : 0 }}
                >
                  <Typography variant="subtitle2" fontWeight={600}>
                    {day.format('dddd, DD.MM')}
                    {isToday && (
                      <Chip
                        label={t('pitches.today')}
                        size="small"
                        color="primary"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </Typography>
                  {scheduledSessions.length > 0 && (
                    <Stack direction="row" alignItems="center" spacing={1}>
                      {isOverbooked && (
                        <Tooltip title={t('pitches.overbookedWarning')}>
                          <Warning color="warning" sx={{ fontSize: 18 }} />
                        </Tooltip>
                      )}
                      <Chip
                        label={`${occupancyPct}%`}
                        size="small"
                        color={
                          isOverbooked
                            ? 'warning'
                            : occupancyPct === 100
                              ? 'success'
                              : 'default'
                        }
                        variant="outlined"
                      />
                    </Stack>
                  )}
                </Stack>

                {scheduledSessions.length > 0 && (
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(occupancyPct, 100)}
                    color={isOverbooked ? 'warning' : 'primary'}
                    sx={{ mb: 1, borderRadius: 1, height: 4 }}
                  />
                )}

                {daySessions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    {t('pitches.noSessions')}
                  </Typography>
                ) : (
                  <Stack spacing={0.5}>
                    {daySessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((session) => (
                        <Box
                          key={session.id}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            pl: 1,
                            cursor: 'pointer',
                            '&:hover': { bgcolor: 'action.hover' },
                            borderRadius: 1,
                            py: 0.5,
                          }}
                          onClick={() =>
                            navigate(`/trainings/${session.id}`)
                          }
                        >
                          <FiberManualRecord
                            sx={{ fontSize: 8 }}
                            color={getStatusColor(session.status)}
                          />
                          <Typography variant="body2" fontWeight={500}>
                            {formatTime(session.startTime)} –{' '}
                            {formatTime(session.endTime)}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {session.teamName}
                          </Typography>
                          {session.pitchPortion < 1 && (
                            <Chip
                              label={getPortionLabel(session.pitchPortion)}
                              size="small"
                              variant="outlined"
                              sx={{ height: 20, fontSize: 11 }}
                            />
                          )}
                          {session.status === TrainingSessionStatus.CANCELLED && (
                            <Chip
                              label={t('trainings.statusCancelled')}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      ))}
                  </Stack>
                )}
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}
