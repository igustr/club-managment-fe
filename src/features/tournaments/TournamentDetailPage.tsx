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
  EmojiEvents,
  Place,
} from '@mui/icons-material';
import {
  useTournament,
  useCancelTournament,
  useDeleteTournament,
} from '@/api/tournament.api';
import { TournamentFormDialog } from './components/TournamentFormDialog';
import { SquadSection } from '@/features/squad/components/SquadSection';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate } from '@/utils/date';
import { TournamentStatus } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function TournamentDetailPage() {
  const { t } = useTranslation();
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining, isClubAdmin } = usePermissions();

  const { data: tournament, isLoading } = useTournament(
    clubId,
    tournamentId!,
  );
  const cancelMutation = useCancelTournament(clubId!);
  const deleteMutation = useDeleteTournament(clubId!);

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(tournamentId!);
      toast.success(t('tournaments.cancelSuccess'));
      setCancelOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(tournamentId!);
      toast.success(t('tournaments.deleteSuccess'));
      navigate('/tournaments');
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

  if (!tournament) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          {t('error.notFound')}
        </Typography>
      </Box>
    );
  }

  const isCancelled =
    tournament.status === TournamentStatus.CANCELLED;

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
          <IconButton onClick={() => navigate('/tournaments')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" fontWeight={700}>
                {tournament.name}
              </Typography>
              <Chip
                label={
                  tournament.status === TournamentStatus.SCHEDULED
                    ? t('tournaments.scheduled')
                    : t('tournaments.cancelled')
                }
                size="small"
                color={
                  tournament.status === TournamentStatus.SCHEDULED
                    ? 'primary'
                    : 'error'
                }
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {tournament.teamName} — {formatDate(tournament.startDate)}{' '}
              – {formatDate(tournament.endDate)}
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
              {t('tournaments.cancelTournament')}
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
          {t('tournaments.tournamentInfo')}
        </Typography>
        <Stack spacing={1.5}>
          <InfoRow
            icon={<EmojiEvents fontSize="small" color="action" />}
            label={t('tournaments.name')}
            value={tournament.name}
          />
          <InfoRow
            icon={<CalendarMonth fontSize="small" color="action" />}
            label={t('tournaments.dates')}
            value={`${formatDate(tournament.startDate)} – ${formatDate(tournament.endDate)}`}
          />
          <InfoRow
            icon={<Groups fontSize="small" color="action" />}
            label={t('trainings.team')}
            value={tournament.teamName}
          />
          {(tournament.pitchName || tournament.venueName || tournament.venueAddress) && (
            <InfoRow
              icon={<Place fontSize="small" color="action" />}
              label={t('tournaments.venue')}
              value={
                [tournament.pitchName, tournament.venueName, tournament.venueAddress]
                  .filter(Boolean)
                  .join(', ')
              }
            />
          )}
          {tournament.notes && (
            <InfoRow
              icon={<Notes fontSize="small" color="action" />}
              label={t('trainings.notes')}
              value={tournament.notes}
            />
          )}
        </Stack>
      </Paper>

      <SquadSection
        entityType="tournament"
        entityId={tournamentId!}
      />

      <TournamentFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        tournament={tournament}
      />

      <ConfirmDialog
        open={cancelOpen}
        title={t('tournaments.cancelTournament')}
        message={t('tournaments.cancelConfirm')}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
        loading={cancelMutation.isPending}
        confirmColor="primary"
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t('tournaments.deleteTournament')}
        message={t('tournaments.deleteConfirm')}
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
