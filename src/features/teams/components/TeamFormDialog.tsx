import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useCreateTeam, useUpdateTeam } from '@/api/team.api';
import { teamSchema, type TeamFormValues } from '@/features/teams/schemas';
import type { TeamDTO } from '@/types/team.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface TeamFormDialogProps {
  open: boolean;
  clubId: string;
  onClose: () => void;
  team?: TeamDTO | null;
}

export function TeamFormDialog({ open, clubId, onClose, team }: TeamFormDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!team;
  const createMutation = useCreateTeam(clubId);
  const updateMutation = useUpdateTeam(clubId, team?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema(t)),
    defaultValues: { name: '', ageGroup: '', season: '' },
  });

  useEffect(() => {
    if (open && team) {
      reset({
        name: team.name ?? '',
        ageGroup: team.ageGroup ?? '',
        season: team.season ?? '',
      });
    } else if (open) {
      reset({ name: '', ageGroup: '', season: '' });
    }
  }, [open, team, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: TeamFormValues) => {
    const payload = {
      name: values.name,
      ageGroup: values.ageGroup || undefined,
      season: values.season || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success(t('teams.editSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('teams.createSuccess'));
      }
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t('teams.editTeam') : t('teams.createTeam')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="team-form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2.5}
          sx={{ mt: 1 }}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label={t('teams.name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="ageGroup"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('teams.ageGroup')}
                placeholder="U-15, U-19..."
                error={!!errors.ageGroup}
                helperText={errors.ageGroup?.message}
              />
            )}
          />
          <Controller
            name="season"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('teams.season')}
                placeholder="2025/2026"
                error={!!errors.season}
                helperText={errors.season?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form="team-form"
          variant="contained"
          disabled={isPending}
        >
          {isPending
            ? t('common.loading')
            : isEdit
              ? t('common.save')
              : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
