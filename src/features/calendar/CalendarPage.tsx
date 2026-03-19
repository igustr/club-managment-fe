import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
  FormControlLabel,
  Switch,
  Stack,
  Chip,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  ViewList,
  CalendarMonth,
  FitnessCenter,
  SportsSoccer,
  EmojiEvents,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useGames } from '@/api/game.api';
import { useTournaments } from '@/api/tournament.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { CalendarFilters } from './components/CalendarFilters';
import { TrainingFormDialog } from '@/features/trainings/components/TrainingFormDialog';
import { GameFormDialog } from '@/features/games/components/GameFormDialog';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';
import { eventTypeColors } from '@/theme';
import type { CalendarEvent } from './components/MonthlyCalendar';
import dayjs from 'dayjs';

export function CalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { isClubAdmin, canCreateTraining } = usePermissions();

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [teamFilter, setTeamFilter] = useState('');
  const [pitchFilter, setPitchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [showTrainings, setShowTrainings] = useState(true);
  const [showGames, setShowGames] = useState(true);
  const [showTournaments, setShowTournaments] = useState(true);
  const [trainingFormOpen, setTrainingFormOpen] = useState(false);
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const { data: trainings } = useTrainings(clubId, myTeamsOnly);
  const { data: games } = useGames(clubId);
  const { data: tournaments } = useTournaments(clubId);
  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Trainings
    if (showTrainings && trainings) {
      trainings
        .filter((tr) => {
          if (teamFilter && tr.teamId !== teamFilter) return false;
          if (pitchFilter && tr.pitchId !== pitchFilter) return false;
          if (statusFilter && tr.status !== statusFilter) return false;
          return true;
        })
        .forEach((tr) => {
          events.push({
            id: tr.id,
            date: tr.date,
            startTime: tr.startTime,
            label: `${tr.teamName}`,
            teamId: tr.teamId,
            teamName: tr.teamName,
            eventType: 'training',
            status: tr.status,
            navigateTo: `/trainings/${tr.id}`,
          });
        });
    }

    // Games
    if (showGames && games) {
      games
        .filter((g) => {
          if (teamFilter && g.teamId !== teamFilter) return false;
          if (statusFilter && g.status !== statusFilter) return false;
          return true;
        })
        .forEach((g) => {
          events.push({
            id: g.id,
            date: g.date,
            startTime: g.startTime,
            label: `vs ${g.opponent}`,
            teamId: g.teamId,
            teamName: g.teamName,
            eventType: 'game',
            status: g.status,
            navigateTo: `/games/${g.id}`,
          });
        });
    }

    // Tournaments — expand multi-day into per-day entries
    if (showTournaments && tournaments) {
      tournaments
        .filter((tr) => {
          if (teamFilter && tr.teamId !== teamFilter) return false;
          if (statusFilter && tr.status !== statusFilter) return false;
          return true;
        })
        .forEach((tr) => {
          let day = dayjs(tr.startDate);
          const end = dayjs(tr.endDate);
          while (day.isBefore(end) || day.isSame(end, 'day')) {
            events.push({
              id: `${tr.id}-${day.format('YYYY-MM-DD')}`,
              originalId: tr.id,
              date: day.format('YYYY-MM-DD'),
              startTime: null,
              label: tr.name,
              teamId: tr.teamId,
              teamName: tr.teamName,
              eventType: 'tournament',
              status: tr.status,
              navigateTo: `/tournaments/${tr.id}`,
            });
            day = day.add(1, 'day');
          }
        });
    }

    return events;
  }, [
    trainings,
    games,
    tournaments,
    teamFilter,
    pitchFilter,
    statusFilter,
    showTrainings,
    showGames,
    showTournaments,
  ]);

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
        <Typography variant="h5" fontWeight={700}>
          {t('calendar.title')}
        </Typography>
        <ToggleButtonGroup
          value="calendar"
          exclusive
          onChange={(_, val) => {
            if (val === 'list') navigate('/trainings');
          }}
          size="small"
        >
          <ToggleButton value="list">
            <ViewList fontSize="small" />
          </ToggleButton>
          <ToggleButton value="calendar">
            <CalendarMonth fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Month navigation + filters */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() =>
              setCurrentMonth((m) => m.subtract(1, 'month'))
            }
          >
            <ChevronLeft />
          </IconButton>
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{ minWidth: 180, textAlign: 'center' }}
          >
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <IconButton
            onClick={() =>
              setCurrentMonth((m) => m.add(1, 'month'))
            }
          >
            <ChevronRight />
          </IconButton>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          {isClubAdmin && (
            <FormControlLabel
              control={
                <Switch
                  checked={myTeamsOnly}
                  onChange={(e) => setMyTeamsOnly(e.target.checked)}
                  size="small"
                />
              }
              label={t('teams.myTeamsOnly')}
            />
          )}
          <CalendarFilters
            teams={teams ?? []}
            pitches={pitches ?? []}
            teamFilter={teamFilter}
            pitchFilter={pitchFilter}
            statusFilter={statusFilter}
            onTeamChange={setTeamFilter}
            onPitchChange={setPitchFilter}
            onStatusChange={setStatusFilter}
          />
        </Box>
      </Box>

      {/* Event type toggles + legend */}
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Chip
          icon={<FitnessCenter sx={{ fontSize: 16 }} />}
          label={t('calendar.trainings')}
          variant={showTrainings ? 'filled' : 'outlined'}
          color="primary"
          onClick={() => setShowTrainings(!showTrainings)}
          size="small"
        />
        <Chip
          icon={<SportsSoccer sx={{ fontSize: 16 }} />}
          label={t('calendar.games')}
          variant={showGames ? 'filled' : 'outlined'}
          onClick={() => setShowGames(!showGames)}
          size="small"
          sx={{
            bgcolor: showGames ? eventTypeColors.game.border : undefined,
            color: showGames ? 'white' : eventTypeColors.game.text,
            borderColor: eventTypeColors.game.border,
            '&:hover': {
              bgcolor: showGames
                ? eventTypeColors.game.text
                : eventTypeColors.game.bg,
            },
          }}
        />
        <Chip
          icon={<EmojiEvents sx={{ fontSize: 16 }} />}
          label={t('calendar.tournaments')}
          variant={showTournaments ? 'filled' : 'outlined'}
          onClick={() => setShowTournaments(!showTournaments)}
          size="small"
          sx={{
            bgcolor: showTournaments
              ? eventTypeColors.tournament.border
              : undefined,
            color: showTournaments
              ? 'white'
              : eventTypeColors.tournament.text,
            borderColor: eventTypeColors.tournament.border,
            '&:hover': {
              bgcolor: showTournaments
                ? eventTypeColors.tournament.text
                : eventTypeColors.tournament.bg,
            },
          }}
        />
      </Stack>

      {/* Calendar grid */}
      <MonthlyCalendar
        month={currentMonth}
        events={calendarEvents}
        canCreate={canCreateTraining}
        onCreateTraining={(date) => {
          setSelectedDate(date);
          setTrainingFormOpen(true);
        }}
        onCreateGame={(date) => {
          setSelectedDate(date);
          setGameFormOpen(true);
        }}
      />

      <TrainingFormDialog
        open={trainingFormOpen}
        onClose={() => setTrainingFormOpen(false)}
        defaultDate={selectedDate}
      />
      <GameFormDialog
        open={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
        defaultDate={selectedDate}
      />
    </Box>
  );
}
