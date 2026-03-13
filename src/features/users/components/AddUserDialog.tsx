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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useUnaffiliated, useAddUserToClub } from '@/api/user.api';
import { ClubRole } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface AddUserDialogProps {
  open: boolean;
  clubId: string;
  onClose: () => void;
}

export function AddUserDialog({ open, clubId, onClose }: AddUserDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [role, setRole] = useState<ClubRole>(ClubRole.PLAYER);
  const addMutation = useAddUserToClub(clubId);

  const { data: usersPage, isLoading } = useUnaffiliated({
    search: search || undefined,
    page: 0,
    size: 10,
  });

  const users = usersPage?.content ?? [];

  const handleClose = () => {
    setSearch('');
    setSelectedUserId(null);
    setRole(ClubRole.PLAYER);
    onClose();
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addMutation.mutateAsync({ userId: selectedUserId, role });
      toast.success(t('users.addSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('users.addUser')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder={t('users.searchUnaffiliated')}
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

        {selectedUserId && (
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel>{t('users.role')}</InputLabel>
            <Select
              value={role}
              label={t('users.role')}
              onChange={(e) => setRole(e.target.value as ClubRole)}
            >
              {Object.values(ClubRole).map((r) => (
                <MenuItem key={r} value={r}>
                  {t(`roles.${r}`)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleAdd}
          disabled={!selectedUserId || addMutation.isPending}
        >
          {addMutation.isPending ? t('common.loading') : t('users.addUser')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
