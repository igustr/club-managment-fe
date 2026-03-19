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
import { Add, Search, SportsSoccer } from '@mui/icons-material';
import { useGames } from '@/api/game.api';
import { useTeams } from '@/api/team.api';
import { GameFormDialog } from './components/GameFormDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { GameStatus, VenueType } from '@/types/common.types';

const statusColors: Record<GameStatus, 'primary' | 'error'> = {
  [GameStatus.SCHEDULED]: 'primary',
  [GameStatus.CANCELLED]: 'error',
};

export function GameListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining } = usePermissions();

  const { data: games, isLoading } = useGames(clubId);
  const { data: teams } = useTeams(clubId);

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [formOpen, setFormOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!games) return [];
    return games.filter((g) => {
      if (teamFilter && g.teamId !== teamFilter) return false;
      if (statusFilter && g.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          g.opponent.toLowerCase().includes(q) ||
          g.teamName.toLowerCase().includes(q) ||
          (g.venueName?.toLowerCase().includes(q) ?? false)
        );
      }
      return true;
    });
  }, [games, search, teamFilter, statusFilter]);

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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t('games.title')}
        </Typography>
        {canCreateTraining && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setFormOpen(true)}
          >
            {t('games.createGame')}
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
          <MenuItem value={GameStatus.SCHEDULED}>
            {t('games.scheduled')}
          </MenuItem>
          <MenuItem value={GameStatus.CANCELLED}>
            {t('games.cancelled')}
          </MenuItem>
        </TextField>
      </Box>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <SportsSoccer
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            {t('games.noGames')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('trainings.date')}</TableCell>
                <TableCell>{t('trainings.time')}</TableCell>
                <TableCell>{t('games.opponent')}</TableCell>
                <TableCell>{t('trainings.team')}</TableCell>
                <TableCell>{t('games.venueType')}</TableCell>
                <TableCell>{t('trainings.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((g) => (
                <TableRow
                  key={g.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/games/${g.id}`)}
                >
                  <TableCell>{formatDate(g.date)}</TableCell>
                  <TableCell>
                    {formatTime(g.startTime)} – {formatTime(g.endTime)}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {g.opponent}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={g.teamName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        g.venueType === VenueType.HOME
                          ? t('games.home')
                          : t('games.away')
                      }
                      size="small"
                      color={
                        g.venueType === VenueType.HOME
                          ? 'primary'
                          : 'secondary'
                      }
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        g.status === GameStatus.SCHEDULED
                          ? t('games.scheduled')
                          : t('games.cancelled')
                      }
                      size="small"
                      color={statusColors[g.status]}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <GameFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />
    </Box>
  );
}
