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
import { useCreateClub } from '@/api/admin.api';
import {
  createClubSchema,
  type CreateClubFormValues,
} from '@/features/admin/schemas';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface CreateClubDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateClubDialog({ open, onClose }: CreateClubDialogProps) {
  const { t } = useTranslation();
  const createClubMutation = useCreateClub();

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

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: CreateClubFormValues) => {
    try {
      await createClubMutation.mutateAsync({
        name: values.name,
        registrationCode: values.registrationCode || undefined,
        address: values.address || undefined,
        contactEmail: values.contactEmail || undefined,
        contactPhone: values.contactPhone || undefined,
      });
      toast.success(t('admin.clubs.createSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.clubs.createClub')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="create-club-form"
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
          form="create-club-form"
          variant="contained"
          disabled={createClubMutation.isPending}
        >
          {createClubMutation.isPending
            ? t('common.loading')
            : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
