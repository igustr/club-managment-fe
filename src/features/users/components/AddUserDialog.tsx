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
  Collapse,
  Autocomplete,
  Chip,
} from '@mui/material';
import { useUnaffiliated, useAddUserToClub, useClubUsers, linkParent } from '@/api/user.api';
import { adminKeys } from '@/api/admin.api';
import { queryClient } from '@/api/query-client';
import { ClubRole } from '@/types/common.types';
import type { UserDTO } from '@/types/auth.types';
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
  const [selectedChildren, setSelectedChildren] = useState<UserDTO[]>([]);
  const [childSearch, setChildSearch] = useState('');
  const addMutation = useAddUserToClub(clubId);

  const { data: usersPage, isLoading } = useUnaffiliated({
    search: search || undefined,
    page: 0,
    size: 10,
  });

  const { data: clubMembersPage } = useClubUsers(
    role === ClubRole.PARENT && selectedUserId ? clubId : null,
    { search: childSearch || undefined, page: 0, size: 50 },
  );

  const playerMembers = (clubMembersPage?.content ?? []).filter(
    (u) => u.role === ClubRole.PLAYER,
  );

  const users = usersPage?.content ?? [];

  const handleClose = () => {
    setSearch('');
    setSelectedUserId(null);
    setRole(ClubRole.PLAYER);
    setSelectedChildren([]);
    setChildSearch('');
    onClose();
  };

  const handleRoleChange = (newRole: ClubRole) => {
    setRole(newRole);
    if (newRole !== ClubRole.PARENT) {
      setSelectedChildren([]);
      setChildSearch('');
    }
  };

  const handleAdd = async () => {
    if (!selectedUserId) return;
    try {
      await addMutation.mutateAsync({ userId: selectedUserId, role });

      // Link selected children if PARENT role
      if (role === ClubRole.PARENT && selectedChildren.length > 0) {
        try {
          await Promise.all(
            selectedChildren.map((child) =>
              linkParent(clubId, child.id, { parentId: selectedUserId }),
            ),
          );
        } catch {
          toast.error(t('users.linkChildrenPartialError'));
        }
      }

      // Invalidate admin club members query for Master Admin context
      queryClient.invalidateQueries({ queryKey: adminKeys.clubMembers(clubId) });

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
              <Box key={user.id}>
                <ListItem disablePadding>
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
                <Collapse in={selectedUserId === user.id}>
                  <Box sx={{ pl: 7, pr: 2, py: 1 }}>
                    <FormControl fullWidth size="small">
                      <InputLabel>{t('users.role')}</InputLabel>
                      <Select
                        value={role}
                        label={t('users.role')}
                        onChange={(e) => handleRoleChange(e.target.value as ClubRole)}
                      >
                        {Object.values(ClubRole).map((r) => (
                          <MenuItem key={r} value={r}>
                            {t(`roles.${r}`)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Collapse>
              </Box>
            ))}
          </List>
        )}

        <Collapse in={role === ClubRole.PARENT && !!selectedUserId}>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
              {t('users.linkChildrenHint')}
            </Typography>
            <Autocomplete
              multiple
              options={playerMembers}
              value={selectedChildren}
              onChange={(_, newValue) => setSelectedChildren(newValue)}
              onInputChange={(_, value) => setChildSearch(value)}
              getOptionLabel={(option) =>
                `${option.firstName} ${option.lastName}`
              }
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="small"
                  placeholder={t('users.searchPlayers')}
                />
              )}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip
                    {...getTagProps({ index })}
                    key={option.id}
                    label={`${option.firstName} ${option.lastName}`}
                    size="small"
                  />
                ))
              }
              noOptionsText={t('users.noPlayersInClub')}
            />
          </Box>
        </Collapse>
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
