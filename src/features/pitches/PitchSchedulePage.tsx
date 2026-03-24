import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  Stack,
  CircularProgress,
  Button,
  TextField,
  MenuItem,
  Chip,
  Alert,
} from '@mui/material';
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  Settings,
  Warning,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { usePitches, usePitchSchedule } from '@/api/pitch.api';
import { useGames } from '@/api/game.api';
import { updateTraining } from '@/api/training.api';
import { pitchKeys } from '@/api/pitch.api';
import { trainingKeys } from '@/api/training.api';
import { queryClient } from '@/api/query-client';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';
import { useUiStore } from '@/stores/uiStore';
import { TimelineView } from './components/TimelineView';
import { TimeRangeSettings } from './components/TimeRangeSettings';
import { minutesToTime, timeToMinutes, snapToInterval } from './utils/timeline';
import { findOverbookingRanges } from './utils/timeline';
import { TrainingSessionStatus } from '@/types/common.types';
import { VenueType } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';
import dayjs from 'dayjs';

export function PitchSchedulePage() {
  const { t } = useTranslation();
  const { pitchId: urlPitchId } = useParams<{ pitchId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining } = usePermissions();

  const startHour = useUiStore((s) => s.scheduleStartHour);
  const endHour = useUiStore((s) => s.scheduleEndHour);

  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedPitchId, setSelectedPitchId] = useState(urlPitchId ?? '');
  const [settingsAnchor, setSettingsAnchor] = useState<HTMLElement | null>(null);

  const { data: pitches, isLoading: pitchesLoading } = usePitches(clubId);

  // Auto-select first pitch when pitches load
  const pitchId = useMemo(() => {
    if (selectedPitchId) return selectedPitchId;
    if (pitches && pitches.length > 0) return pitches[0]!.id;
    return '';
  }, [selectedPitchId, pitches]);

  const dateStr = selectedDate.format('YYYY-MM-DD');

  const { data: schedule, isLoading: scheduleLoading } = usePitchSchedule(
    clubId,
    pitchId,
    dateStr,
    dateStr,
  );

  const { data: games } = useGames(clubId);

  // Filter games for this pitch on this date
  const pitchGames = useMemo(
    () =>
      (games ?? []).filter(
        (g) =>
          g.venueType === VenueType.HOME &&
          g.pitchId === pitchId &&
          g.date === dateStr,
      ),
    [games, pitchId, dateStr],
  );

  // Overbooking detection for warning banner
  const overbookingRanges = useMemo(() => {
    const sessions = [
      ...(schedule ?? [])
        .filter((s) => s.status !== TrainingSessionStatus.CANCELLED)
        .map((s) => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          pitchPortion: s.pitchPortion,
        })),
      ...pitchGames.map((g) => ({
        id: g.id,
        startTime: g.startTime,
        endTime: g.endTime,
        pitchPortion: 1,
      })),
    ];
    return findOverbookingRanges(sessions);
  }, [schedule, pitchGames]);

  const selectedPitch = pitches?.find((p) => p.id === pitchId);

  const handleDragEnd = async (trainingId: string, deltaMinutes: number) => {
    const training = schedule?.find((s) => s.id === trainingId);
    if (!training || !clubId) return;

    const startMins = timeToMinutes(training.startTime) + deltaMinutes;
    const endMins = timeToMinutes(training.endTime) + deltaMinutes;
    const newStart = minutesToTime(snapToInterval(startMins));
    const newEnd = minutesToTime(snapToInterval(endMins));

    try {
      await updateTraining(clubId, trainingId, {
        date: training.date,
        startTime: newStart,
        endTime: newEnd,
        pitchId: training.pitchId ?? undefined,
        pitchPortion: training.pitchPortion,
        notes: training.notes ?? undefined,
      });
      toast.success(t('pitches.moveSuccess'));
      queryClient.invalidateQueries({ queryKey: pitchKeys.all });
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleBlockClick = (type: 'training' | 'game', id: string) => {
    if (type === 'training') {
      navigate(`/trainings/${id}`);
    } else {
      navigate(`/games/${id}`);
    }
  };

  if (pitchesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!pitches || pitches.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('pitches.noPitches')}</Typography>
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
              {t('pitches.schedule')}
            </Typography>
            {selectedPitch && (
              <Typography variant="body2" color="text.secondary">
                {selectedPitch.name}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton onClick={(e) => setSettingsAnchor(e.currentTarget)}>
          <Settings />
        </IconButton>
      </Box>

      {/* Pitch selector + Date navigation */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <TextField
          select
          size="small"
          value={pitchId}
          onChange={(e) => setSelectedPitchId(e.target.value)}
          label={t('pitches.selectPitch')}
          sx={{ minWidth: 200 }}
        >
          {pitches.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.name}
            </MenuItem>
          ))}
        </TextField>

        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton
            onClick={() => setSelectedDate((d) => d.subtract(1, 'day'))}
          >
            <ChevronLeft />
          </IconButton>
          <DatePicker
            value={selectedDate}
            onChange={(val) => val && setSelectedDate(val)}
            slotProps={{
              textField: { size: 'small', sx: { width: 160 } },
            }}
          />
          <IconButton
            onClick={() => setSelectedDate((d) => d.add(1, 'day'))}
          >
            <ChevronRight />
          </IconButton>
          {!selectedDate.isSame(dayjs(), 'day') && (
            <Button size="small" onClick={() => setSelectedDate(dayjs())}>
              {t('pitches.today')}
            </Button>
          )}
        </Stack>
      </Box>

      {/* Day of week chip */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} alignItems="center">
        <Chip
          label={selectedDate.format('dddd, DD.MM.YYYY')}
          variant="outlined"
          color={selectedDate.isSame(dayjs(), 'day') ? 'primary' : 'default'}
        />
        {scheduleLoading && <CircularProgress size={18} />}
      </Stack>

      {/* Overbooking warning */}
      {overbookingRanges.length > 0 && (
        <Alert
          severity="warning"
          icon={<Warning />}
          sx={{ mb: 2 }}
        >
          {t('pitches.overbookedWarning')}
        </Alert>
      )}

      {/* Timeline */}
      {pitchId && (
        <TimelineView
          trainings={schedule ?? []}
          games={pitchGames}
          date={dateStr}
          startHour={startHour}
          endHour={endHour}
          canDrag={canCreateTraining}
          onTrainingDragEnd={handleDragEnd}
          onBlockClick={handleBlockClick}
        />
      )}

      {/* Legend */}
      <Stack direction="row" spacing={2} sx={{ mt: 2, px: 1 }}>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 12, height: 12, bgcolor: '#1976d2', borderRadius: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {t('calendar.trainings')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Box sx={{ width: 12, height: 12, bgcolor: '#F59E0B', borderRadius: 0.5 }} />
          <Typography variant="caption" color="text.secondary">
            {t('calendar.games')}
          </Typography>
        </Stack>
        {canCreateTraining && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            {t('pitches.dragToMove')}
          </Typography>
        )}
      </Stack>

      <TimeRangeSettings
        anchorEl={settingsAnchor}
        onClose={() => setSettingsAnchor(null)}
      />
    </Box>
  );
}
