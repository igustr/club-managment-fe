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
import { useAdminCreateUser } from '@/api/admin.api';
import {
  adminCreateUserSchema,
  type AdminCreateUserFormValues,
} from '@/features/admin/schemas';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface CreateUserDialogProps {
  open: boolean;
  onClose: () => void;
}

export function CreateUserDialog({ open, onClose }: CreateUserDialogProps) {
  const { t } = useTranslation();
  const createUserMutation = useAdminCreateUser();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminCreateUserFormValues>({
    resolver: zodResolver(adminCreateUserSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      phone: '',
      password: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: AdminCreateUserFormValues) => {
    try {
      await createUserMutation.mutateAsync(values);
      toast.success(t('admin.users.createSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.users.createUser')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="create-user-form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2.5}
          sx={{ mt: 1 }}
        >
          <Stack direction="row" spacing={2}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('admin.users.firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
                  autoFocus
                />
              )}
            />
            <Controller
              name="lastName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('admin.users.lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Stack>
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('admin.users.email')}
                type="email"
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('admin.users.dateOfBirth')}
                  type="date"
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth?.message}
                  slotProps={{ inputLabel: { shrink: true } }}
                />
              )}
            />
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('admin.users.phone')}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                />
              )}
            />
          </Stack>
          <Controller
            name="password"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('admin.users.password')}
                type="password"
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form="create-user-form"
          variant="contained"
          disabled={createUserMutation.isPending}
        >
          {createUserMutation.isPending
            ? t('common.loading')
            : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
