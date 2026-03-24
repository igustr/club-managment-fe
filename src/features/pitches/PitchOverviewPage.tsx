import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Warning,
} from '@mui/icons-material';
import { usePitches, usePitchOverview } from '@/api/pitch.api';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { PITCH_PORTIONS } from '@/features/trainings/schemas';
import dayjs from 'dayjs';
import type { TrainingSessionDTO } from '@/types/training.types';

export function PitchOverviewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();

  const [weekOffset, setWeekOffset] = useState(0);
  const startDate = dayjs().startOf('week').add(weekOffset, 'week');
  const endDate = startDate.add(6, 'day');

  const { data: pitches, isLoading: pitchesLoading } = usePitches(clubId);
  const { data: overview, isLoading: overviewLoading } = usePitchOverview(
    clubId,
    startDate.format('YYYY-MM-DD'),
    endDate.format('YYYY-MM-DD'),
  );

  const days = Array.from({ length: 7 }, (_, i) => startDate.add(i, 'day'));

  const getPortionLabel = (portion: number) =>
    PITCH_PORTIONS.find((p) => p.value === portion)?.label ?? `${portion}`;

  // Build a lookup: pitchId -> date -> { sessions, totalOccupancy }
  const matrix: Record<
    string,
    Record<string, { sessions: TrainingSessionDTO[]; totalOccupancy: number }>
  > = {};

  if (overview) {
    for (const item of overview) {
      if (!matrix[item.pitchId]) matrix[item.pitchId] = {};
      matrix[item.pitchId]![item.date] = {
        sessions: item.sessions,
        totalOccupancy: item.totalOccupancy,
      };
    }
  }

  const isLoading = pitchesLoading || overviewLoading;

  const getOccupancyColor = (pct: number) => {
    if (pct > 100) return 'warning.light';
    if (pct === 100) return 'success.light';
    if (pct > 0) return 'primary.50';
    return undefined;
  };

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
              {t('pitches.overview')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pitches.overviewSubtitle')}
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

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      ) : !pitches?.length ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">
            {t('pitches.noPitches')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell
                  sx={{
                    fontWeight: 700,
                    minWidth: 140,
                    bgcolor: 'background.paper',
                    position: 'sticky',
                    left: 0,
                    zIndex: 3,
                  }}
                >
                  {t('pitches.pitch')}
                </TableCell>
                {days.map((day) => {
                  const isToday = day.isSame(dayjs(), 'day');
                  return (
                    <TableCell
                      key={day.format('YYYY-MM-DD')}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        minWidth: 150,
                        bgcolor: isToday ? 'primary.50' : 'background.paper',
                      }}
                    >
                      <Typography variant="caption" fontWeight={600}>
                        {day.format('ddd')}
                      </Typography>
                      <br />
                      <Typography variant="caption">
                        {day.format('DD.MM')}
                      </Typography>
                      {isToday && (
                        <Chip
                          label={t('pitches.today')}
                          size="small"
                          color="primary"
                          sx={{ ml: 0.5, height: 16, fontSize: 9 }}
                        />
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {pitches.map((pitch) => (
                <TableRow key={pitch.id} hover>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      position: 'sticky',
                      left: 0,
                      bgcolor: 'background.paper',
                      zIndex: 1,
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                    onClick={() =>
                      navigate(`/pitches/${pitch.id}/schedule`)
                    }
                  >
                    {pitch.name}
                  </TableCell>
                  {days.map((day) => {
                    const dayStr = day.format('YYYY-MM-DD');
                    const cell = matrix[pitch.id]?.[dayStr];
                    const sessions = cell?.sessions ?? [];
                    const totalOccupancy = cell?.totalOccupancy ?? 0;
                    const pct = Math.round(totalOccupancy * 100);
                    const isOverbooked = totalOccupancy > 1;

                    return (
                      <TableCell
                        key={dayStr}
                        align="center"
                        sx={{
                          bgcolor: getOccupancyColor(pct),
                          borderLeft: '1px solid',
                          borderColor: 'divider',
                          p: 1,
                          verticalAlign: 'top',
                        }}
                      >
                        {sessions.length > 0 ? (
                          <Stack spacing={0.5} alignItems="center">
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                              justifyContent="center"
                            >
                              {isOverbooked && (
                                <Tooltip
                                  title={t('pitches.overbookedWarning')}
                                >
                                  <Warning
                                    color="warning"
                                    sx={{ fontSize: 14 }}
                                  />
                                </Tooltip>
                              )}
                              <Chip
                                label={`${pct}%`}
                                size="small"
                                color={
                                  isOverbooked
                                    ? 'warning'
                                    : pct === 100
                                      ? 'success'
                                      : 'default'
                                }
                                variant="outlined"
                                sx={{ height: 20, fontSize: 11 }}
                              />
                            </Stack>
                            {sessions.map((s) => (
                              <Tooltip
                                key={s.id}
                                title={`${s.teamName} (${getPortionLabel(s.pitchPortion)})`}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    cursor: 'pointer',
                                    '&:hover': {
                                      textDecoration: 'underline',
                                    },
                                    whiteSpace: 'nowrap',
                                    fontSize: 11,
                                  }}
                                  onClick={() =>
                                    navigate(`/trainings/${s.id}`)
                                  }
                                >
                                  {formatTime(s.startTime)}–
                                  {formatTime(s.endTime)}{' '}
                                  {s.teamName.length > 8
                                    ? s.teamName.slice(0, 8) + '…'
                                    : s.teamName}
                                </Typography>
                              </Tooltip>
                            ))}
                          </Stack>
                        ) : (
                          <Typography
                            variant="caption"
                            color="text.disabled"
                          >
                            —
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
