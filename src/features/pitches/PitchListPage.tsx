import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Grid2 as Grid,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  Add,
  Place,
  Grass,
  Edit,
  Delete,
  CalendarMonth,
  Search,
  ArrowBack,
  Warning,
} from '@mui/icons-material';
import Badge from '@mui/material/Badge';
import {
  usePitches,
  useDeletePitch,
  usePitchScheduleOverview,
} from '@/api/pitch.api';
import dayjs from 'dayjs';
import { PitchFormDialog } from './components/PitchFormDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import type { PitchDTO } from '@/types/pitch.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function PitchListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { isClubAdmin } = usePermissions();

  const { data: pitches, isLoading } = usePitches(clubId);
  const deleteMutation = useDeletePitch(clubId!);

  // Background poll for conflicts in the next 30 days, only when admin can see the button.
  const conflictRangeFrom = dayjs().format('YYYY-MM-DD');
  const conflictRangeTo = dayjs().add(30, 'day').format('YYYY-MM-DD');
  const { data: scheduleData } = usePitchScheduleOverview(
    isClubAdmin ? clubId : null,
    conflictRangeFrom,
    conflictRangeTo,
  );
  const conflictCount = scheduleData?.conflicts.length ?? 0;

  const [search, setSearch] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editPitch, setEditPitch] = useState<PitchDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PitchDTO | null>(null);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(t('pitches.deleteSuccess'));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/pitches')} size="small">
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {t('pitches.manageTitle')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('pitches.manageSubtitle')}
            </Typography>
          </Box>
        </Stack>
        {isClubAdmin && (
          <Stack direction="row" spacing={1}>
            <Badge
              badgeContent={conflictCount}
              color="error"
              max={99}
              overlap="rectangular"
            >
              <Button
                variant="outlined"
                color={conflictCount > 0 ? 'error' : 'inherit'}
                startIcon={<Warning />}
                onClick={() => navigate('/pitches')}
              >
                {t('pitches.backToSchedule')}
              </Button>
            </Badge>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
            >
              {t('pitches.createPitch')}
            </Button>
          </Stack>
        )}
      </Box>

      {(pitches?.length ?? 0) > 4 && (
        <TextField
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mb: 3, width: 280 }}
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
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : !pitches || pitches.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Place sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {t('pitches.noPitches')}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {pitches.filter((pitch) => {
            if (!search) return true;
            const q = search.toLowerCase();
            return (
              pitch.name.toLowerCase().includes(q) ||
              (pitch.address?.toLowerCase().includes(q) ?? false) ||
              (pitch.surfaceType ? t(`pitches.surfaceTypes.${pitch.surfaceType}`).toLowerCase().includes(q) : false)
            );
          }).map((pitch) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pitch.id}>
              <Card variant="outlined" sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {pitch.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {pitch.address && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Place fontSize="small" color="action" />
                        <Typography variant="body2" color="text.secondary">
                          {pitch.address}
                        </Typography>
                      </Box>
                    )}
                    {pitch.surfaceType && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Grass fontSize="small" color="action" />
                        <Chip label={t(`pitches.surfaceTypes.${pitch.surfaceType}`)} size="small" variant="outlined" />
                      </Box>
                    )}
                  </Box>
                </CardContent>
                {isClubAdmin && (
                  <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
                    <Tooltip title={t('pitches.schedule')}>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/pitches/${pitch.id}/schedule`)}
                      >
                        <CalendarMonth fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.edit')}>
                      <IconButton
                        size="small"
                        onClick={() => setEditPitch(pitch)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteTarget(pitch)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                )}
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <PitchFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <PitchFormDialog
        open={!!editPitch}
        onClose={() => setEditPitch(null)}
        pitch={editPitch}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('pitches.deletePitch')}
        message={t('pitches.deleteConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </Box>
  );
}
