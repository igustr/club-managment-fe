import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Typography,
  Button,
  Paper,
  Stack,
  TextField,
  CircularProgress,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
} from '@mui/material';
import { ArrowBack, Delete } from '@mui/icons-material';
import {
  useClubUser,
  useUpdateClubUser,
  useParents,
  useChildren,
  useUnlinkParent,
} from '@/api/user.api';
import { useClubId } from '@/hooks/useClubId';
import { clubRoleColors } from '@/utils/roles';
import { ClubRole } from '@/types/common.types';
import { updateUserSchema, type UpdateUserFormValues } from './schemas';
import { LinkParentDialog } from './components/LinkParentDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function UserDetailPage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const [linkParentOpen, setLinkParentOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const { data: user, isLoading } = useClubUser(clubId, userId);
  const updateMutation = useUpdateClubUser(clubId!, userId!);
  const { data: parents } = useParents(clubId, userId);
  const { data: children } = useChildren(clubId, userId);
  const unlinkMutation = useUnlinkParent(clubId!, userId!);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateUserFormValues>({
    resolver: zodResolver(updateUserSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      phone: '',
      role: ClubRole.PLAYER,
      active: true,
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone ?? '',
        role: (user.role as ClubRole) ?? ClubRole.PLAYER,
        active: user.active,
      });
    }
  }, [user, reset]);

  const onSubmit = async (values: UpdateUserFormValues) => {
    try {
      await updateMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone || undefined,
        role: values.role,
        active: values.active,
      });
      toast.success(t('users.updateSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleUnlinkParent = async () => {
    if (!unlinkTarget) return;
    try {
      await unlinkMutation.mutateAsync(unlinkTarget.id);
      toast.success(t('users.unlinkParentSuccess'));
      setUnlinkTarget(null);
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

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">{t('error.notFound')}</Typography>
      </Box>
    );
  }

  const isPlayerOrParent =
    user.role === ClubRole.PLAYER || user.role === ClubRole.PARENT;

  return (
    <Box>
      {/* Header */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
        <IconButton onClick={() => navigate('/users')}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" fontWeight={700}>
          {user.firstName} {user.lastName}
        </Typography>
        {user.role && (
          <Chip
            label={t(`roles.${user.role}`)}
            size="small"
            sx={{
              bgcolor: clubRoleColors[user.role as ClubRole] + '1A',
              color: clubRoleColors[user.role as ClubRole],
              fontWeight: 600,
            }}
          />
        )}
      </Stack>

      {/* User form */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 600 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('users.profileInfo')}
        </Typography>
        <Stack
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2.5}
        >
          <Stack direction="row" spacing={2}>
            <Controller
              name="firstName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('users.firstName')}
                  error={!!errors.firstName}
                  helperText={errors.firstName?.message}
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
                  label={t('users.lastName')}
                  error={!!errors.lastName}
                  helperText={errors.lastName?.message}
                />
              )}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            {t('users.email')}: {user.email}
          </Typography>

          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('users.phone')}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            )}
          />

          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <FormControl fullWidth>
                <InputLabel>{t('users.role')}</InputLabel>
                <Select {...field} label={t('users.role')}>
                  {Object.values(ClubRole).map((r) => (
                    <MenuItem key={r} value={r}>
                      {t(`roles.${r}`)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          />

          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                  />
                }
                label={t('users.activeStatus')}
              />
            )}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              disabled={!isDirty || updateMutation.isPending}
            >
              {updateMutation.isPending
                ? t('common.loading')
                : t('common.save')}
            </Button>
          </Box>
        </Stack>
      </Paper>

      {/* Parent-child section — only for PLAYER/PARENT */}
      {isPlayerOrParent && (
        <>
          {/* Parents */}
          {user.role === ClubRole.PLAYER && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 600 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Typography variant="subtitle1" fontWeight={600}>
                  {t('users.parents')} ({parents?.length ?? 0})
                </Typography>
                <Button
                  size="small"
                  onClick={() => setLinkParentOpen(true)}
                >
                  {t('users.linkParent')}
                </Button>
              </Stack>
              {parents && parents.length > 0 ? (
                <List disablePadding>
                  {parents.map((parent) => (
                    <ListItem
                      key={parent.id}
                      secondaryAction={
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setUnlinkTarget({
                              id: parent.id,
                              name: `${parent.firstName} ${parent.lastName}`,
                            })
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      }
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                          {parent.firstName.charAt(0)}
                          {parent.lastName.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={`${parent.firstName} ${parent.lastName}`}
                        secondary={parent.email}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  {t('users.noParents')}
                </Typography>
              )}
            </Paper>
          )}

          {/* Children */}
          {user.role === ClubRole.PARENT && children && children.length > 0 && (
            <Paper variant="outlined" sx={{ p: 3, mb: 3, maxWidth: 600 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('users.children')} ({children.length})
              </Typography>
              <List disablePadding>
                {children.map((child) => (
                  <ListItem key={child.id}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                        {child.firstName.charAt(0)}
                        {child.lastName.charAt(0)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${child.firstName} ${child.lastName}`}
                      secondary={child.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </>
      )}

      <LinkParentDialog
        open={linkParentOpen}
        clubId={clubId!}
        userId={userId!}
        onClose={() => setLinkParentOpen(false)}
      />

      <ConfirmDialog
        open={!!unlinkTarget}
        title={t('users.unlinkParentTitle')}
        message={t('users.unlinkParentConfirm', { name: unlinkTarget?.name })}
        onConfirm={handleUnlinkParent}
        onCancel={() => setUnlinkTarget(null)}
        loading={unlinkMutation.isPending}
      />
    </Box>
  );
}
