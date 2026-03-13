import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  CircularProgress,
} from '@mui/material';
import { useClub, useUpdateClub } from '@/api/club.api';
import { useClubId } from '@/hooks/useClubId';
import { updateClubSchema, type UpdateClubFormValues } from './schemas';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ClubSettingsPage() {
  const { t } = useTranslation();
  const clubId = useClubId();
  const { data: club, isLoading } = useClub(clubId);
  const updateMutation = useUpdateClub(clubId!);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateClubFormValues>({
    resolver: zodResolver(updateClubSchema(t)),
    defaultValues: {
      name: '',
      registrationCode: '',
      address: '',
      contactEmail: '',
      contactPhone: '',
    },
  });

  useEffect(() => {
    if (club) {
      reset({
        name: club.name,
        registrationCode: club.registrationCode ?? '',
        address: club.address ?? '',
        contactEmail: club.contactEmail ?? '',
        contactPhone: club.contactPhone ?? '',
      });
    }
  }, [club, reset]);

  const onSubmit = async (values: UpdateClubFormValues) => {
    try {
      await updateMutation.mutateAsync({
        name: values.name,
        registrationCode: values.registrationCode || undefined,
        address: values.address || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
      });
      toast.success(t('clubs.settings.saveSuccess'));
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

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 3 }}>
        {t('clubs.settings.title')}
      </Typography>

      <Paper variant="outlined" sx={{ p: 3, maxWidth: 600 }}>
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2.5}
        >
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('clubs.settings.name')}
                error={!!errors.name}
                helperText={errors.name?.message}
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
                label={t('clubs.settings.registrationCode')}
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
                label={t('clubs.settings.address')}
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
                label={t('clubs.settings.contactEmail')}
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
                label={t('clubs.settings.contactPhone')}
                error={!!errors.contactPhone}
                helperText={errors.contactPhone?.message}
              />
            )}
          />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending ? t('common.loading') : t('common.save')}
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
