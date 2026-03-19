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
  Menu,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  Add,
  Search,
  SportsSoccer,
  EmojiEvents,
  ArrowDropDown,
} from '@mui/icons-material';
import { useGames } from '@/api/game.api';
import { useTournaments } from '@/api/tournament.api';
import { useTeams } from '@/api/team.api';
import { GameFormDialog } from './components/GameFormDialog';
import { TournamentFormDialog } from '@/features/tournaments/components/TournamentFormDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { VenueType } from '@/types/common.types';

type EventType = 'all' | 'game' | 'tournament';

interface UnifiedEvent {
  id: string;
  type: 'game' | 'tournament';
  name: string;
  date: string;
  dateDisplay: string;
  teamName: string;
  teamId: string;
  status: 'SCHEDULED' | 'CANCELLED';
  venueType?: VenueType;
}

export function GameListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining } = usePermissions();

  const { data: games, isLoading: gamesLoading } = useGames(clubId);
  const { data: tournaments, isLoading: tournamentsLoading } =
    useTournaments(clubId);
  const { data: teams } = useTeams(clubId);

  const [search, setSearch] = useState('');
  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [eventType, setEventType] = useState<EventType>('all');
  const [gameFormOpen, setGameFormOpen] = useState(false);
  const [tournamentFormOpen, setTournamentFormOpen] = useState(false);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);

  const isLoading = gamesLoading || tournamentsLoading;

  const unified = useMemo<UnifiedEvent[]>(() => {
    const items: UnifiedEvent[] = [];

    if (eventType !== 'tournament') {
      for (const g of games ?? []) {
        items.push({
          id: g.id,
          type: 'game',
          name: g.opponent,
          date: g.date,
          dateDisplay: `${formatDate(g.date)} ${formatTime(g.startTime)} – ${formatTime(g.endTime)}`,
          teamName: g.teamName,
          teamId: g.teamId,
          status: g.status,
          venueType: g.venueType,
        });
      }
    }

    if (eventType !== 'game') {
      for (const tr of tournaments ?? []) {
        items.push({
          id: tr.id,
          type: 'tournament',
          name: tr.name,
          date: tr.startDate,
          dateDisplay: `${formatDate(tr.startDate)} – ${formatDate(tr.endDate)}`,
          teamName: tr.teamName,
          teamId: tr.teamId,
          status: tr.status,
        });
      }
    }

    return items;
  }, [games, tournaments, eventType]);

  const filtered = useMemo(() => {
    return unified.filter((e) => {
      if (teamFilter && e.teamId !== teamFilter) return false;
      if (statusFilter && e.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          e.name.toLowerCase().includes(q) ||
          e.teamName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [unified, search, teamFilter, statusFilter]);

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => b.date.localeCompare(a.date)),
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
          <>
            <Button
              variant="contained"
              startIcon={<Add />}
              endIcon={<ArrowDropDown />}
              onClick={(e) => setAddMenuAnchor(e.currentTarget)}
            >
              {t('common.create')}
            </Button>
            <Menu
              anchorEl={addMenuAnchor}
              open={!!addMenuAnchor}
              onClose={() => setAddMenuAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  setAddMenuAnchor(null);
                  setGameFormOpen(true);
                }}
              >
                <SportsSoccer fontSize="small" sx={{ mr: 1 }} />
                {t('games.createGame')}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  setAddMenuAnchor(null);
                  setTournamentFormOpen(true);
                }}
              >
                <EmojiEvents fontSize="small" sx={{ mr: 1 }} />
                {t('tournaments.createTournament')}
              </MenuItem>
            </Menu>
          </>
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
        <ToggleButtonGroup
          value={eventType}
          exclusive
          onChange={(_, val) => {
            if (val) setEventType(val);
          }}
          size="small"
        >
          <ToggleButton value="all">{t('games.allEvents')}</ToggleButton>
          <ToggleButton value="game">{t('games.gamesOnly')}</ToggleButton>
          <ToggleButton value="tournament">
            {t('games.tournamentsOnly')}
          </ToggleButton>
        </ToggleButtonGroup>
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
          <MenuItem value="SCHEDULED">{t('games.scheduled')}</MenuItem>
          <MenuItem value="CANCELLED">{t('games.cancelled')}</MenuItem>
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
                <TableCell>{t('games.eventType')}</TableCell>
                <TableCell>{t('games.nameOrOpponent')}</TableCell>
                <TableCell>{t('trainings.date')}</TableCell>
                <TableCell>{t('trainings.team')}</TableCell>
                <TableCell>{t('trainings.status')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((e) => (
                <TableRow
                  key={`${e.type}-${e.id}`}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() =>
                    navigate(
                      e.type === 'game'
                        ? `/games/${e.id}`
                        : `/tournaments/${e.id}`,
                    )
                  }
                >
                  <TableCell>
                    <Chip
                      icon={
                        e.type === 'game' ? (
                          <SportsSoccer fontSize="small" />
                        ) : (
                          <EmojiEvents fontSize="small" />
                        )
                      }
                      label={
                        e.type === 'game'
                          ? t('games.game')
                          : t('games.tournament')
                      }
                      size="small"
                      variant="outlined"
                      color={e.type === 'game' ? 'warning' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {e.name}
                    </Typography>
                    {e.type === 'game' && e.venueType && (
                      <Typography variant="caption" color="text.secondary">
                        {e.venueType === VenueType.HOME
                          ? t('games.home')
                          : t('games.away')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>{e.dateDisplay}</TableCell>
                  <TableCell>
                    <Chip
                      label={e.teamName}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        e.status === 'SCHEDULED'
                          ? t('games.scheduled')
                          : t('games.cancelled')
                      }
                      size="small"
                      color={e.status === 'SCHEDULED' ? 'primary' : 'error'}
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
        open={gameFormOpen}
        onClose={() => setGameFormOpen(false)}
      />
      <TournamentFormDialog
        open={tournamentFormOpen}
        onClose={() => setTournamentFormOpen(false)}
      />
    </Box>
  );
}
