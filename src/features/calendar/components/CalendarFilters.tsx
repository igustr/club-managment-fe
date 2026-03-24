import { useTranslation } from 'react-i18next';
import { Box, TextField, MenuItem } from '@mui/material';
import type { TeamDTO } from '@/types/team.types';
import type { PitchDTO } from '@/types/pitch.types';
import { TrainingSessionStatus } from '@/types/common.types';

interface CalendarFiltersProps {
  teams: TeamDTO[];
  pitches: PitchDTO[];
  teamFilter: string;
  pitchFilter: string;
  statusFilter: string;
  onTeamChange: (value: string) => void;
  onPitchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  showPitchFilter?: boolean;
}

export function CalendarFilters({
  teams,
  pitches,
  teamFilter,
  pitchFilter,
  statusFilter,
  onTeamChange,
  onPitchChange,
  onStatusChange,
  showPitchFilter = true,
}: CalendarFiltersProps) {
  const { t } = useTranslation();

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      <TextField
        select
        size="small"
        value={teamFilter}
        onChange={(e) => onTeamChange(e.target.value)}
        label={t('trainings.team')}
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="">{t('trainings.allTeams')}</MenuItem>
        {teams.map((team) => (
          <MenuItem key={team.id} value={team.id}>
            {team.name}
          </MenuItem>
        ))}
      </TextField>
      {showPitchFilter && (
        <TextField
          select
          size="small"
          value={pitchFilter}
          onChange={(e) => onPitchChange(e.target.value)}
          label={t('trainings.pitch')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('calendar.allPitches')}</MenuItem>
          {pitches.map((pitch) => (
            <MenuItem key={pitch.id} value={pitch.id}>
              {pitch.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      <TextField
        select
        size="small"
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        label={t('trainings.status')}
        sx={{ minWidth: 140 }}
      >
        <MenuItem value="">{t('trainings.allStatuses')}</MenuItem>
        <MenuItem value={TrainingSessionStatus.SCHEDULED}>
          {t('trainings.statusScheduled')}
        </MenuItem>
        <MenuItem value={TrainingSessionStatus.CANCELLED}>
          {t('trainings.statusCancelled')}
        </MenuItem>
        <MenuItem value={TrainingSessionStatus.COMPLETED}>
          {t('trainings.statusCompleted')}
        </MenuItem>
      </TextField>
    </Box>
  );
}
