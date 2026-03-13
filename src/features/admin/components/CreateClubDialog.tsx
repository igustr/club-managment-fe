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
import { useCreateClub, useAdminUpdateClub } from '@/api/admin.api';
import {
  createClubSchema,
  type CreateClubFormValues,
} from '@/features/admin/schemas';
import type { ClubDTO } from '@/types/club.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface CreateClubDialogProps {
  open: boolean;
  onClose: () => void;
  club?: ClubDTO | null;
}

export function CreateClubDialog({ open, onClose, club }: CreateClubDialogProps) {
  const { t } = useTranslation();
  const isEdit = !!club;
  const createClubMutation = useCreateClub();
  const updateClubMutation = useAdminUpdateClub(club?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClubFormValues>({
    resolver: zodResolver(createClubSchema(t)),
    defaultValues: {
      name: '',
      registrationCode: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (open && club) {
      reset({
        name: club.name ?? '',
        registrationCode: club.registrationCode ?? '',
        address: club.address ?? '',
        contactEmail: club.contactEmail ?? '',
        contactPhone: club.contactPhone ?? '',
      });
    } else if (open) {
      reset({
        name: '',
        registrationCode: '',
        address: '',
        contactEmail: '',
        contactPhone: '',
      });
    }
  }, [open, club, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: CreateClubFormValues) => {
    const payload = {
      name: values.name,
      registrationCode: values.registrationCode || undefined,
      address: values.address || undefined,
      contactEmail: values.contactEmail || undefined,
      contactPhone: values.contactPhone || undefined,
    };

    try {
      if (isEdit) {
        await updateClubMutation.mutateAsync(payload);
        toast.success(t('admin.clubs.editSuccess'));
      } else {
        await createClubMutation.mutateAsync(payload);
        toast.success(t('admin.clubs.createSuccess'));
      }
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending = createClubMutation.isPending || updateClubMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t('admin.clubs.editClub') : t('admin.clubs.createClub')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="club-form"
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
                label={t('admin.clubs.name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                autoFocus
              />
            )}
          />
          <Controller
            name="registrationCode"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('admin.clubs.registrationCode')}
                error={!!errors.registrationCode}
                helperText={errors.registrationCode?.message}
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
                label={t('admin.clubs.address')}
                error={!!errors.address}
                helperText={errors.address?.message}
              />
            )}
          />
          <Controller
            name="contactEmail"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('admin.clubs.contactEmail')}
                type="email"
                error={!!errors.contactEmail}
                helperText={errors.contactEmail?.message}
              />
            )}
          />
          <Controller
            name="contactPhone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('admin.clubs.contactPhone')}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form="club-form"
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
