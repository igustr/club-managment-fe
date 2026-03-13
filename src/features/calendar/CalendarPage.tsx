import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  IconButton,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { ChevronLeft, ChevronRight, ViewList, CalendarMonth } from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { CalendarFilters } from './components/CalendarFilters';
import { useClubId } from '@/hooks/useClubId';
import dayjs from 'dayjs';

export function CalendarPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();

  const [currentMonth, setCurrentMonth] = useState(dayjs().startOf('month'));
  const [teamFilter, setTeamFilter] = useState('');
  const [pitchFilter, setPitchFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: trainings } = useTrainings(clubId);
  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);

  const filtered = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter((tr) => {
      if (teamFilter && tr.teamId !== teamFilter) return false;
      if (pitchFilter && tr.pitchId !== pitchFilter) return false;
      if (statusFilter && tr.status !== statusFilter) return false;
      return true;
    });
  }, [trainings, teamFilter, pitchFilter, statusFilter]);

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
          <IconButton onClick={() => setCurrentMonth((m) => m.subtract(1, 'month'))}>
            <ChevronLeft />
          </IconButton>
          <Typography variant="h6" fontWeight={600} sx={{ minWidth: 180, textAlign: 'center' }}>
            {currentMonth.format('MMMM YYYY')}
          </Typography>
          <IconButton onClick={() => setCurrentMonth((m) => m.add(1, 'month'))}>
            <ChevronRight />
          </IconButton>
        </Box>

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

      {/* Calendar grid */}
      <MonthlyCalendar month={currentMonth} sessions={filtered} />
    </Box>
  );
}
