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
import { useClubUsers, useLinkParent } from '@/api/user.api';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface LinkParentDialogProps {
  open: boolean;
  clubId: string;
  userId: string;
  onClose: () => void;
}

export function LinkParentDialog({
  open,
  clubId,
  userId,
  onClose,
}: LinkParentDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const linkMutation = useLinkParent(clubId, userId);

  const { data: usersPage, isLoading } = useClubUsers(clubId, {
    search: search || undefined,
    page: 0,
    size: 10,
  });

  // Filter out the current user from the list
  const users = (usersPage?.content ?? []).filter((u) => u.id !== userId);

  const handleClose = () => {
    setSearch('');
    setSelectedParentId(null);
    onClose();
  };

  const handleLink = async () => {
    if (!selectedParentId) return;
    try {
      await linkMutation.mutateAsync({ parentId: selectedParentId });
      toast.success(t('users.linkParentSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('users.linkParent')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder={t('users.searchClubMembers')}
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
                  selected={selectedParentId === user.id}
                  onClick={() => setSelectedParentId(user.id)}
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
                    secondary={`${user.email}${user.role ? ` · ${t(`roles.${user.role}`)}` : ''}`}
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
          onClick={handleLink}
          disabled={!selectedParentId || linkMutation.isPending}
        >
          {linkMutation.isPending ? t('common.loading') : t('users.linkParent')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
