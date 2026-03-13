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
  Chip,
} from '@mui/material';
import { useClubUsers } from '@/api/user.api';
import { useAddTeamMember } from '@/api/team.api';
import type { TeamMemberDTO } from '@/types/team.types';
import { clubRoleColors } from '@/utils/roles';
import type { ClubRole } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface AddMemberDialogProps {
  open: boolean;
  clubId: string;
  teamId: string;
  existingMembers: TeamMemberDTO[];
  onClose: () => void;
}

export function AddMemberDialog({
  open,
  clubId,
  teamId,
  existingMembers,
  onClose,
}: AddMemberDialogProps) {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const addMemberMutation = useAddTeamMember(clubId, teamId);

  const { data: usersPage, isLoading } = useClubUsers(clubId, {
    search: search || undefined,
    page: 0,
    size: 20,
  });

  // Filter out users already in the team
  const existingUserIds = new Set(existingMembers.map((m) => m.userId));
  const availableUsers = (usersPage?.content ?? []).filter(
    (u) => !existingUserIds.has(u.id),
  );

  const handleClose = () => {
    setSearch('');
    setSelectedUserId(null);
    onClose();
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addMemberMutation.mutateAsync({ userId: selectedUserId });
      toast.success(t('teams.addMemberSuccess'));
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('teams.addMember')}</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          placeholder={t('teams.searchClubMembers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ mt: 1, mb: 2 }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : availableUsers.length === 0 ? (
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
            {availableUsers.map((user) => (
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
                  {user.role && (
                    <Chip
                      label={t(`roles.${user.role}`)}
                      size="small"
                      sx={{
                        bgcolor:
                          clubRoleColors[user.role as ClubRole] + '1A',
                        color: clubRoleColors[user.role as ClubRole],
                        fontWeight: 600,
                        fontSize: 11,
                      }}
                    />
                  )}
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
          onClick={handleAdd}
          disabled={!selectedUserId || addMemberMutation.isPending}
        >
          {addMemberMutation.isPending
            ? t('common.loading')
            : t('teams.addMember')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
