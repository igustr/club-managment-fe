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
  TextField,
  MenuItem,
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
import { useChildren } from '@/api/user.api';
import { useAuthStore } from '@/stores/authStore';
import { getTeamMembers } from '@/api/team.api';
import { useQueries } from '@tanstack/react-query';
import { teamKeys } from '@/api/team.api';
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
  const { isClubAdmin, isParent, canCreateTraining } = usePermissions();
  const user = useAuthStore((s) => s.user);

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [teamFilter, setTeamFilter] = useState('');
  const [pitchFilter, setPitchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);
  const [showTrainings, setShowTrainings] = useState(true);
  const [showGames, setShowGames] = useState(true);
  const [showTournaments, setShowTournaments] = useState(true);
  const [childFilter, setChildFilter] = useState('');
  const [trainingFormOpen, setTrainingFormOpen] = useState(false);
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  const { data: trainings } = useTrainings(clubId, myTeamsOnly);
  const { data: games } = useGames(clubId);
  const { data: tournaments } = useTournaments(clubId);
  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);
  const { data: children } = useChildren(clubId, isParent ? user?.id : undefined);

  // Fetch team members for parent child filter
  const teamMemberQueries = useQueries({
    queries: (isParent && clubId && teams ? teams : []).map((team) => ({
      queryKey: teamKeys.members(clubId!, team.id),
      queryFn: () => getTeamMembers(clubId!, team.id),
      enabled: isParent && !!clubId,
      staleTime: 5 * 60 * 1000,
    })),
  });

  // Build child → teamIds mapping
  const childTeamIds = useMemo(() => {
    if (!isParent || !children || !teams) return new Map<string, string[]>();
    const map = new Map<string, string[]>();
    children.forEach((child) => map.set(child.id, []));
    teamMemberQueries.forEach((query, index) => {
      if (query.data && teams[index]) {
        const teamId = teams[index].id;
        query.data.forEach((member) => {
          const existing = map.get(member.userId);
          if (existing) existing.push(teamId);
        });
      }
    });
    return map;
  }, [isParent, children, teams, teamMemberQueries]);

  // Get team IDs for selected child
  const selectedChildTeamIds = useMemo(
    () => (childFilter ? childTeamIds.get(childFilter) ?? [] : []),
    [childFilter, childTeamIds],
  );

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const events: CalendarEvent[] = [];

    const matchesChildFilter = (teamId: string) => {
      if (!childFilter) return true;
      return selectedChildTeamIds.includes(teamId);
    };

    // Trainings
    if (showTrainings && trainings) {
      trainings
        .filter((tr) => {
          if (teamFilter && tr.teamId !== teamFilter) return false;
          if (pitchFilter && tr.pitchId !== pitchFilter) return false;
          if (statusFilter && tr.status !== statusFilter) return false;
          if (!matchesChildFilter(tr.teamId)) return false;
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
          if (!matchesChildFilter(g.teamId)) return false;
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
          if (!matchesChildFilter(tr.teamId)) return false;
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
    childFilter,
    selectedChildTeamIds,
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
          {isParent && children && children.length > 0 && (
            <TextField
              select
              size="small"
              value={childFilter}
              onChange={(e) => setChildFilter(e.target.value)}
              label={t('calendar.childFilter')}
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="">{t('calendar.allChildren')}</MenuItem>
              {children.map((child) => (
                <MenuItem key={child.id} value={child.id}>
                  {child.firstName} {child.lastName}
                </MenuItem>
              ))}
            </TextField>
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
            showPitchFilter={isClubAdmin}
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
