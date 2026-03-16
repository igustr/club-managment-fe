import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  Search,
  ViewList,
  CalendarMonth,
  Repeat,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { TrainingFormDialog } from './components/TrainingFormDialog';
import { RecurringTrainingDialog } from './components/RecurringTrainingDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { TrainingSessionStatus } from '@/types/common.types';

const statusColors: Record<
  TrainingSessionStatus,
  'primary' | 'error' | 'success'
> = {
  [TrainingSessionStatus.SCHEDULED]: 'primary',
  [TrainingSessionStatus.CANCELLED]: 'error',
  [TrainingSessionStatus.COMPLETED]: 'success',
};

export function TrainingListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining, isClubAdmin } = usePermissions();
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);

  const { data: trainings, isLoading } = useTrainings(clubId, myTeamsOnly);
  const { data: teams } = useTeams(clubId);

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter((tr) => {
      if (teamFilter && tr.teamId !== teamFilter) return false;
      if (statusFilter && tr.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          tr.teamName.toLowerCase().includes(q) ||
          (tr.pitchName?.toLowerCase().includes(q) ?? false) ||
          (tr.notes?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [trainings, search, teamFilter, statusFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dateCmp = b.date.localeCompare(a.date);
        if (dateCmp !== 0) return dateCmp;
        return a.startTime.localeCompare(b.startTime);
      }),
    [filtered],
  );

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
          {t('trainings.title')}
        </Typography>
        {canCreateTraining && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Repeat />}
              onClick={() => setRecurringOpen(true)}
            >
              {t('trainings.createRecurring')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
            >
              {t('trainings.createTraining')}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ width: 280 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <TextField
          select
          size="small"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          label={t('trainings.team')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('trainings.allTeams')}</MenuItem>
          {(teams ?? []).map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
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
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => {
            if (val === 'calendar') {
              navigate('/calendar');
            } else if (val) {
              setViewMode(val);
            }
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

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarMonth
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            {t('trainings.noTrainings')}
          </Typography>
        </Box>
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
              {sorted.map((tr) => (
                <TableRow
                  key={tr.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/trainings/${tr.id}`)}
                >
                  <TableCell>{formatDate(tr.date)}</TableCell>
                  <TableCell>
                    {formatTime(tr.startTime)} – {formatTime(tr.endTime)}
                  </TableCell>
                  <TableCell>
                    <Chip label={tr.teamName} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{tr.pitchName ?? '—'}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`trainings.status${tr.status.charAt(0) + tr.status.slice(1).toLowerCase()}`)}
                      size="small"
                      color={statusColors[tr.status]}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TrainingFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <RecurringTrainingDialog
        open={recurringOpen}
        onClose={() => setRecurringOpen(false)}
      />
    </Box>
  );
}
