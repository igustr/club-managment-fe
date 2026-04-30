import { useMemo, useState } from 'react';
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
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Warning,
  CheckCircle,
  Settings,
  GridView,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { usePitchScheduleOverview } from '@/api/pitch.api';
import { useClubId } from '@/hooks/useClubId';
import { useUiStore } from '@/stores/uiStore';
import { usePermissions } from '@/hooks/usePermissions';
import { VerticalScheduleGrid } from './components/VerticalScheduleGrid';
import { formatTime, formatDate } from '@/utils/date';
import dayjs from 'dayjs';
import type {
  PitchConflictDTO,
  PitchScheduleEventDTO,
} from '@/types/pitch.types';

export function PitchConflictsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { isClubAdmin } = usePermissions();

  const startHour = useUiStore((s) => s.scheduleStartHour);
  const endHour = useUiStore((s) => s.scheduleEndHour);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  // Range: fetch the whole week containing selectedDate so navigation between
  // days inside the week is instant (no refetch).
  const weekStart = selectedDate.startOf('week');
  const weekEnd = selectedDate.endOf('week');
  const fromStr = weekStart.format('YYYY-MM-DD');
  const toStr = weekEnd.format('YYYY-MM-DD');
  const dateStr = selectedDate.format('YYYY-MM-DD');

  const { data, isLoading, isError, error } = usePitchScheduleOverview(
    clubId,
    fromStr,
    toStr,
  );

  const dayConflicts = useMemo<PitchConflictDTO[]>(
    () => (data?.conflicts ?? []).filter((c) => c.date === dateStr),
    [data, dateStr],
  );

  const conflictEventIds = useMemo(() => {
    const ids = new Set<string>();
    for (const c of dayConflicts) {
      for (const id of c.eventIds) ids.add(id);
    }
    return ids;
  }, [dayConflicts]);

  const handleEventClick = (event: PitchScheduleEventDTO) => {
    if (event.eventType === 'TRAINING') {
      navigate(`/trainings/${event.id}`);
    } else {
      navigate(`/games/${event.id}`);
    }
  };

  const isToday = selectedDate.isSame(dayjs(), 'day');

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            {t('pitches.scheduleView.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('pitches.scheduleView.subtitle')}
          </Typography>
        </Box>
        {isClubAdmin && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<GridView />}
              onClick={() => navigate('/pitches/overview')}
            >
              {t('pitches.overview')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Settings />}
              onClick={() => navigate('/pitches/manage')}
            >
              {t('pitches.manageButton')}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Date navigation */}
      <Paper variant="outlined" sx={{ p: 1.5, mb: 2 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          spacing={1}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              onClick={() => setSelectedDate((d) => d.subtract(1, 'day'))}
              size="small"
            >
              <ChevronLeft />
            </IconButton>
            <DatePicker
              value={selectedDate}
              onChange={(val) => val && setSelectedDate(val)}
              slotProps={{
                textField: { size: 'small', sx: { width: 170 } },
              }}
            />
            <IconButton
              onClick={() => setSelectedDate((d) => d.add(1, 'day'))}
              size="small"
            >
              <ChevronRight />
            </IconButton>
            {!isToday && (
              <Button size="small" onClick={() => setSelectedDate(dayjs())}>
                {t('pitches.today')}
              </Button>
            )}
          </Stack>
          <Chip
            label={selectedDate.format('dddd, DD.MM.YYYY')}
            color={isToday ? 'primary' : 'default'}
            variant="outlined"
          />
        </Stack>
      </Paper>

      {/* Loading */}
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress size={28} />
        </Box>
      )}

      {/* Error */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : t('common.error')}
        </Alert>
      )}

      {!isLoading && !isError && data && (
        <>
          {/* Conflict summary */}
          {dayConflicts.length === 0 ? (
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{ mb: 2 }}
            >
              {t('pitches.scheduleView.noConflicts')}
            </Alert>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                mb: 2,
                borderColor: 'error.light',
                bgcolor: 'error.lighter',
              }}
            >
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  bgcolor: 'error.main',
                  color: 'common.white',
                }}
              >
                <Warning fontSize="small" />
                <Typography variant="subtitle2" fontWeight={700}>
                  {t('pitches.scheduleView.conflictCount', {
                    count: dayConflicts.length,
                  })}
                </Typography>
              </Box>
              <Divider />
              <List dense disablePadding>
                {dayConflicts.map((c, idx) => (
                  <ListItem
                    key={`${c.pitchId}-${c.overlapStart}-${idx}`}
                    disablePadding
                    divider={idx < dayConflicts.length - 1}
                  >
                    <ListItemButton
                      onClick={() => {
                        const firstId = c.eventIds[0];
                        const event = data.pitches
                          .find((p) => p.pitchId === c.pitchId)
                          ?.events.find((e) => e.id === firstId);
                        if (event) handleEventClick(event);
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            flexWrap="wrap"
                          >
                            <Warning
                              fontSize="small"
                              sx={{ color: 'error.main' }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {c.pitchName}
                            </Typography>
                            <Chip
                              label={`${formatTime(c.overlapStart)}–${formatTime(c.overlapEnd)}`}
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                            <Chip
                              label={`${Math.round(c.totalOccupancy * 100)}%`}
                              size="small"
                              color="error"
                            />
                          </Stack>
                        }
                        secondary={
                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {formatDate(c.date)} ·{' '}
                            {t('pitches.scheduleView.eventsInvolved', {
                              count: c.eventIds.length,
                            })}
                          </Typography>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Vertical schedule grid */}
          <VerticalScheduleGrid
            pitches={data.pitches}
            date={dateStr}
            startHour={startHour}
            endHour={endHour}
            conflictEventIds={conflictEventIds}
            onEventClick={handleEventClick}
          />

          {/* Legend */}
          <Stack
            direction="row"
            spacing={2}
            sx={{ mt: 2, px: 1, flexWrap: 'wrap', gap: 1 }}
          >
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  bgcolor: '#E3F2FD',
                  border: '1px solid #1976D2',
                  borderLeft: '4px solid #1976D2',
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('calendar.trainings')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  bgcolor: '#FFF8E1',
                  border: '1px solid #F59E0B',
                  borderLeft: '4px solid #F59E0B',
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('calendar.games')}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  border: '2px solid',
                  borderColor: 'error.main',
                  borderRadius: 0.5,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {t('pitches.scheduleView.conflictMark')}
              </Typography>
            </Stack>
          </Stack>
        </>
      )}
    </Box>
  );
}
