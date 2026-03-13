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
import { useCreatePitch, useUpdatePitch } from '@/api/pitch.api';
import { pitchSchema, type PitchFormValues } from '@/features/pitches/schemas';
import type { PitchDTO } from '@/types/pitch.types';
import { useClubId } from '@/hooks/useClubId';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface PitchFormDialogProps {
  open: boolean;
  onClose: () => void;
  pitch?: PitchDTO | null;
}

export function PitchFormDialog({ open, onClose, pitch }: PitchFormDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const isEdit = !!pitch;
  const createMutation = useCreatePitch(clubId!);
  const updateMutation = useUpdatePitch(clubId!, pitch?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PitchFormValues>({
    resolver: zodResolver(pitchSchema(t)),
    defaultValues: {
      name: '',
      address: '',
      surfaceType: '',
      capacity: undefined,
    },
  });

  useEffect(() => {
    if (open && pitch) {
      reset({
        name: pitch.name ?? '',
        address: pitch.address ?? '',
        surfaceType: pitch.surfaceType ?? '',
        capacity: pitch.capacity ?? undefined,
      });
    } else if (open) {
      reset({
        name: '',
        address: '',
        surfaceType: '',
        capacity: undefined,
      });
    }
  }, [open, pitch, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: PitchFormValues) => {
    const payload = {
      name: values.name,
      address: values.address || undefined,
      surfaceType: values.surfaceType || undefined,
      capacity: values.capacity || undefined,
    };

    try {
      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success(t('pitches.editSuccess'));
      } else {
        await createMutation.mutateAsync(payload);
        toast.success(t('pitches.createSuccess'));
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
        {isEdit ? t('pitches.editPitch') : t('pitches.createPitch')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="pitch-form"
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
                label={t('pitches.name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('pitches.address')}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <Controller
              name="surfaceType"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('pitches.surfaceType')}
                  error={!!errors.surfaceType}
                  helperText={errors.surfaceType?.message}
                />
              )}
            />
            <Controller
              name="capacity"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    field.onChange(val === '' ? undefined : Number(val));
                  }}
                  fullWidth
                  label={t('pitches.capacity')}
                  type="number"
                  error={!!errors.capacity}
                  helperText={errors.capacity?.message}
                />
              )}
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form="pitch-form"
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
