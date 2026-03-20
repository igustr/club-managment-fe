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
  Place,
  Groups,
  Notes,
  CalendarMonth,
  AccessTime,
} from '@mui/icons-material';
import {
  useTraining,
  useCancelTraining,
  useDeleteTraining,
} from '@/api/training.api';
import { TrainingFormDialog } from './components/TrainingFormDialog';
import { AttendanceSection } from '@/features/attendance/components/AttendanceSection';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { TrainingSessionStatus } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function TrainingDetailPage() {
  const { t } = useTranslation();
  const { trainingId } = useParams<{ trainingId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining, isClubAdmin } = usePermissions();

  const { data: training, isLoading } = useTraining(clubId, trainingId!);
  const cancelMutation = useCancelTraining(clubId!);
  const deleteMutation = useDeleteTraining(clubId!);

  const [editOpen, setEditOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(trainingId!);
      toast.success(t('trainings.cancelSuccess'));
      setCancelOpen(false);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(trainingId!);
      toast.success(t('trainings.deleteSuccess'));
      navigate('/trainings');
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

  if (!training) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('error.notFound')}</Typography>
      </Box>
    );
  }

  const isCancelled = training.status === TrainingSessionStatus.CANCELLED;
  const statusColors: Record<string, 'primary' | 'error' | 'success'> = {
    [TrainingSessionStatus.SCHEDULED]: 'primary',
    [TrainingSessionStatus.CANCELLED]: 'error',
    [TrainingSessionStatus.COMPLETED]: 'success',
  };

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/trainings')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="h5" fontWeight={700}>
                {t('trainings.trainingDetail')}
              </Typography>
              <Chip
                label={t(`trainings.status${training.status.charAt(0) + training.status.slice(1).toLowerCase()}`)}
                size="small"
                color={statusColors[training.status]}
                variant="outlined"
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {training.teamName} — {formatDate(training.date)}
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
              color="error"
              startIcon={<Cancel />}
              onClick={() => setCancelOpen(true)}
            >
              {t('trainings.cancelTraining')}
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

      {/* Training Info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('trainings.trainingInfo')}
        </Typography>
        <Stack spacing={1.5}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100, ml: 3.5 }}>
              {t('trainings.status')}
            </Typography>
            <Chip
              label={t(`trainings.status${training.status.charAt(0) + training.status.slice(1).toLowerCase()}`)}
              size="small"
              color={statusColors[training.status]}
              variant={isCancelled ? 'filled' : 'outlined'}
            />
          </Box>
          <InfoRow
            icon={<CalendarMonth fontSize="small" color="action" />}
            label={t('trainings.date')}
            value={formatDate(training.date)}
          />
          <InfoRow
            icon={<AccessTime fontSize="small" color="action" />}
            label={t('trainings.time')}
            value={`${formatTime(training.startTime)} – ${formatTime(training.endTime)}`}
          />
          <InfoRow
            icon={<Groups fontSize="small" color="action" />}
            label={t('trainings.team')}
            value={training.teamName}
          />
          {training.pitchName && (
            <InfoRow
              icon={<Place fontSize="small" color="action" />}
              label={t('trainings.pitch')}
              value={training.pitchName}
            />
          )}
          {training.notes && (
            <InfoRow
              icon={<Notes fontSize="small" color="action" />}
              label={t('trainings.notes')}
              value={training.notes}
            />
          )}
        </Stack>
      </Paper>

      {/* Attendance — hide for cancelled trainings */}
      {!isCancelled && <AttendanceSection trainingId={trainingId!} />}

      {/* Dialogs */}
      <TrainingFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        training={training}
      />

      <ConfirmDialog
        open={cancelOpen}
        title={t('trainings.cancelTraining')}
        message={t('trainings.cancelConfirm')}
        onConfirm={handleCancel}
        onCancel={() => setCancelOpen(false)}
        loading={cancelMutation.isPending}
        confirmColor="primary"
      />

      <ConfirmDialog
        open={deleteOpen}
        title={t('trainings.deleteTraining')}
        message={t('trainings.deleteConfirm')}
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
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 100 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
