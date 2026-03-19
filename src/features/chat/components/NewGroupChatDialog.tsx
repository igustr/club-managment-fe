import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  Button,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { useClubUsers } from '@/api/user.api';
import { useTeams, useTeamMembers } from '@/api/team.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import type { UserDTO } from '@/types/auth.types';

interface NewGroupChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, participantIds: string[]) => void;
  loading?: boolean;
}

export function NewGroupChatDialog({
  open,
  onClose,
  onCreate,
  loading,
}: NewGroupChatDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const [search, setSearch] = useState('');
  const [groupName, setGroupName] = useState('');
  const [selected, setSelected] = useState<UserDTO[]>([]);
  const [teamFilter, setTeamFilter] = useState<string>('');

  const { data: teams } = useTeams(clubId);
  const { data: teamMembers } = useTeamMembers(clubId, teamFilter || undefined);

  const { data: usersPage, isLoading } = useClubUsers(clubId, {
    search: search || undefined,
    size: 50,
  });

  const teamMemberIds = useMemo(
    () => new Set(teamMembers?.map((m) => m.userId) ?? []),
    [teamMembers],
  );

  const users = useMemo(() => {
    let list = (usersPage?.content ?? []).filter(
      (u) => u.id !== currentUserId && !selected.some((s) => s.id === u.id),
    );
    if (teamFilter && teamMembers) {
      list = list.filter((u) => teamMemberIds.has(u.id));
    }
    return list;
  }, [usersPage, currentUserId, selected, teamFilter, teamMembers, teamMemberIds]);

  const handleToggle = (user: UserDTO) => {
    setSelected((prev) =>
      prev.some((s) => s.id === user.id)
        ? prev.filter((s) => s.id !== user.id)
        : [...prev, user],
    );
  };

  const handleRemove = (userId: string) => {
    setSelected((prev) => prev.filter((s) => s.id !== userId));
  };

  const handleCreate = () => {
    if (!groupName.trim() || selected.length === 0) return;
    onCreate(
      groupName.trim(),
      selected.map((s) => s.id),
    );
  };

  const handleClose = () => {
    setSearch('');
    setGroupName('');
    setSelected([]);
    setTeamFilter('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t('chat.newGroupChat')}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          size="small"
          label={t('chat.groupName')}
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          sx={{ mb: 2 }}
        />

        {selected.length > 0 && (
          <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mb: 2, gap: 0.5 }}>
            {selected.map((user) => (
              <Chip
                key={user.id}
                label={`${user.firstName} ${user.lastName}`}
                size="small"
                onDelete={() => handleRemove(user.id)}
              />
            ))}
          </Stack>
        )}

        <FormControl fullWidth size="small" sx={{ mb: 2 }}>
          <InputLabel>{t('chat.filterByTeam')}</InputLabel>
          <Select
            value={teamFilter}
            label={t('chat.filterByTeam')}
            onChange={(e) => setTeamFilter(e.target.value)}
          >
            <MenuItem value="">{t('chat.allUsers')}</MenuItem>
            {(teams ?? []).map((team) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          size="small"
          placeholder={t('chat.searchUsers')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1 }}
        />

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : users.length === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: 'center', py: 2 }}
          >
            {t('common.noResults')}
          </Typography>
        ) : (
          <List dense disablePadding sx={{ maxHeight: 300, overflow: 'auto' }}>
            {users.map((user) => (
              <ListItemButton
                key={user.id}
                onClick={() => handleToggle(user)}
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
      <DialogActions>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleCreate}
          disabled={loading || !groupName.trim() || selected.length === 0}
        >
          {t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
