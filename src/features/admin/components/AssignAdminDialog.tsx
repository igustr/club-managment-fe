import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Box,
  CircularProgress,
} from '@mui/material';
import { useAdminUsers, useAssignClubAdmin } from '@/api/admin.api';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface AssignAdminDialogProps {
  open: boolean;
  clubId: string;
  onClose: () => void;
}

export function AssignAdminDialog({
  open,
  clubId,
  onClose,
}: AssignAdminDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const assignMutation = useAssignClubAdmin(clubId);

  const { data: usersPage, isLoading } = useAdminUsers({
    search: search || undefined,
    unaffiliated: true,
    page: 0,
    size: 10,
  });

  const users = usersPage?.content ?? [];

  const handleClose = () => {
    setSearch('');
    setSelectedUserId(null);
    onClose();
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;
    try {
      await assignMutation.mutateAsync({ userId: selectedUserId });
      toast.success(t('admin.clubs.assignAdminSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('admin.clubs.assignAdmin')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder={t('admin.clubs.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mt: 1, mb: 2 }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            textAlign="center"
            sx={{ py: 3 }}
          >
            {t('common.noResults')}
          </Typography>
        ) : (
          <List disablePadding>
            {users.map((user) => (
              <ListItem key={user.id} disablePadding>
                <ListItemButton
                  selected={selectedUserId === user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ width: 32, height: 32, fontSize: 13 }}>
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={`${user.firstName} ${user.lastName}`}
                    secondary={user.email}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleAssign}
          disabled={!selectedUserId || assignMutation.isPending}
        >
          {assignMutation.isPending
            ? t('common.loading')
            : t('common.confirm')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
