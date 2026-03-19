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
  MenuItem,
} from '@mui/material';
import { Add, Search, EmojiEvents } from '@mui/icons-material';
import { useTournaments } from '@/api/tournament.api';
import { useTeams } from '@/api/team.api';
import { TournamentFormDialog } from './components/TournamentFormDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate } from '@/utils/date';
import { TournamentStatus } from '@/types/common.types';

const statusColors: Record<TournamentStatus, 'primary' | 'error'> = {
  [TournamentStatus.SCHEDULED]: 'primary',
  [TournamentStatus.CANCELLED]: 'error',
};

export function TournamentListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining } = usePermissions();

  const { data: tournaments, isLoading } = useTournaments(clubId);
  const { data: teams } = useTeams(clubId);

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!tournaments) return [];
    return tournaments.filter((t) => {
      if (teamFilter && t.teamId !== teamFilter) return false;
      if (statusFilter && t.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          t.name.toLowerCase().includes(q) ||
          t.teamName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [tournaments, search, teamFilter, statusFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        b.startDate.localeCompare(a.startDate),
      ),
    [filtered],
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t('tournaments.title')}
        </Typography>
        {canCreateTraining && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            {t('tournaments.createTournament')}
          </Button>
        )}
      </Box>

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
          <MenuItem value={TournamentStatus.SCHEDULED}>
            {t('tournaments.scheduled')}
          </MenuItem>
          <MenuItem value={TournamentStatus.CANCELLED}>
            {t('tournaments.cancelled')}
          </MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <EmojiEvents
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            {t('tournaments.noTournaments')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('tournaments.name')}</TableCell>
                <TableCell>{t('tournaments.dates')}</TableCell>
                <TableCell>{t('trainings.team')}</TableCell>
                <TableCell>{t('trainings.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((tr) => (
                <TableRow
                  key={tr.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/tournaments/${tr.id}`)}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {tr.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {formatDate(tr.startDate)} – {formatDate(tr.endDate)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={tr.teamName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        tr.status === TournamentStatus.SCHEDULED
                          ? t('tournaments.scheduled')
                          : t('tournaments.cancelled')
                      }
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

      <TournamentFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </Box>
  );
}
