import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  Cancel,
  Groups,
  Notes,
  CalendarMonth,
  AccessTime,
  SportsSoccer,
  Home,
  FlightTakeoff,
  GroupWork,
} from '@mui/icons-material';
import { useGame, useCancelGame, useDeleteGame } from '@/api/game.api';
import { GameFormDialog } from './components/GameFormDialog';
import { SquadSection } from '@/features/squad/components/SquadSection';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { GameStatus, VenueType } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

function getMinutesBefore(gatheringTime: string, startTime: string): number {
  const gParts = gatheringTime.split(':').map(Number);
  const sParts = startTime.split(':').map(Number);
  const gh = gParts[0] ?? 0;
  const gm = gParts[1] ?? 0;
  const sh = sParts[0] ?? 0;
  const sm = sParts[1] ?? 0;
  return (sh * 60 + sm) - (gh * 60 + gm);
}

export function GameDetailPage() {
  const { t } = useTranslation();
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining, isClubAdmin } = usePermissions();

  const { data: game, isLoading } = useGame(clubId, gameId!);
  const cancelMutation = useCancelGame(clubId!);
  const deleteMutation = useDeleteGame(clubId!);

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(gameId!);
      toast.success(t('games.cancelSuccess'));
      setCancelOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(gameId!);
      toast.success(t('games.deleteSuccess'));
      navigate('/games');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!game) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('error.notFound')}</Typography>
      </Box>
    );
  }

  const isCancelled = game.status === GameStatus.CANCELLED;

  const venueDisplay =
    game.venueType === VenueType.HOME
      ? game.pitchName ?? t('games.home')
      : [game.venueName, game.venueAddress].filter(Boolean).join(', ') ||
        t('games.away');

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/games')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" fontWeight={700}>
                {t('games.gameDetail')}
              </Typography>
              <Chip
                label={
                  game.status === GameStatus.SCHEDULED
                    ? t('games.scheduled')
                    : t('games.cancelled')
                }
                size="small"
                color={
                  game.status === GameStatus.SCHEDULED
                    ? 'primary'
                    : 'error'
                }
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {game.teamName} vs {game.opponent} — {formatDate(game.date)}
            </Typography>
          </Box>
        </Stack>
        {canCreateTraining && !isCancelled && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditOpen(true)}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="outlined"
              color="warning"
              startIcon={<Cancel />}
              onClick={() => setCancelOpen(true)}
            >
              {t('games.cancelGame')}
            </Button>
            {isClubAdmin && (
              <Button
                variant="outlined"
                color="error"
                startIcon={<Delete />}
                onClick={() => setDeleteOpen(true)}
              >
                {t('common.delete')}
              </Button>
            )}
          </Stack>
        )}
      </Box>

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('games.gameInfo')}
        </Typography>
        <Stack spacing={1.5}>
          <InfoRow
            icon={<SportsSoccer fontSize="small" color="action" />}
            label={t('games.opponent')}
            value={game.opponent}
          />
          <InfoRow
            icon={<CalendarMonth fontSize="small" color="action" />}
            label={t('trainings.date')}
            value={formatDate(game.date)}
          />
          {game.gatheringTime && (
            <InfoRow
              icon={<GroupWork fontSize="small" color="action" />}
              label={t('games.gatheringTime')}
              value={`${formatTime(game.gatheringTime)} (${t('games.gatheringBefore', { minutes: getMinutesBefore(game.gatheringTime, game.startTime) })})`}
            />
          )}
          <InfoRow
            icon={<AccessTime fontSize="small" color="action" />}
            label={t('trainings.time')}
            value={`${formatTime(game.startTime)} – ${formatTime(game.endTime)}`}
          />
          <InfoRow
            icon={<Groups fontSize="small" color="action" />}
            label={t('trainings.team')}
            value={game.teamName}
          />
          <InfoRow
            icon={
              game.venueType === VenueType.HOME ? (
                <Home fontSize="small" color="action" />
              ) : (
                <FlightTakeoff fontSize="small" color="action" />
              )
            }
            label={t('games.venueType')}
            value={`${game.venueType === VenueType.HOME ? t('games.home') : t('games.away')} — ${venueDisplay}`}
          />
          {game.notes && (
            <InfoRow
              icon={<Notes fontSize="small" color="action" />}
              label={t('trainings.notes')}
              value={game.notes}
            />
          )}
        </Stack>
      </Paper>

      <SquadSection entityType="game" entityId={gameId!} />

      <GameFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        game={game}
      />

      <ConfirmDialog
        open={cancelOpen}
        title={t('games.cancelGame')}
        message={t('games.cancelConfirm')}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
        loading={cancelMutation.isPending}
        confirmColor="primary"
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t('games.deleteGame')}
        message={t('games.deleteConfirm')}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {icon}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 100 }}
      >
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
