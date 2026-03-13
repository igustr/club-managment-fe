import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
} from '@mui/material';
import { useClubUsers } from '@/api/user.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';

interface NewDirectChatDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  loading?: boolean;
}

export function NewDirectChatDialog({
  open,
  onClose,
  onSelect,
  loading,
}: NewDirectChatDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState('');

  const { data: usersPage, isLoading } = useClubUsers(clubId, {
    search: search || undefined,
    size: 20,
  });

  const users = (usersPage?.content ?? []).filter(
    (u) => u.id !== currentUserId,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('chat.newConversation')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          placeholder={t('chat.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 2 }}
        />
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
            {t('common.noResults')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {users.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => onSelect(user.id)}
                disabled={loading}
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
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItemButton>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
