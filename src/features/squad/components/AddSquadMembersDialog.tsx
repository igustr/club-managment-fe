import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Checkbox,
  MenuItem,
  Typography,
  Box,
  Chip,
  Divider,
  Stack,
} from '@mui/material';
import { Search, Groups, PersonAdd } from '@mui/icons-material';
import { useTeams, useTeamMembers } from '@/api/team.api';
import { useClubId } from '@/hooks/useClubId';
import type { TeamDTO, TeamMemberDTO } from '@/types/team.types';

interface AddSquadMembersDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (userIds: string[]) => void;
  existingMemberIds: string[];
  loading: boolean;
}

export function AddSquadMembersDialog({
  open,
  onClose,
  onAdd,
  existingMemberIds,
  loading,
}: AddSquadMembersDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const { data: teams } = useTeams(clubId);

  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(
    new Set(),
  );
  const [search, setSearch] = useState('');

  const { data: teamMembers } = useTeamMembers(
    clubId,
    selectedTeamId || undefined,
  );

  const filteredMembers = useMemo(() => {
    if (!teamMembers) return [];
    return teamMembers.filter((m) => {
      if (search) {
        const q = search.toLowerCase();
        const fullName =
          `${m.firstName} ${m.lastName}`.toLowerCase();
        if (!fullName.includes(q) && !m.email.toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [teamMembers, search]);

  const handleToggle = (userId: string) => {
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const handleSelectAllTeam = () => {
    if (!teamMembers) return;
    const newIds = teamMembers
      .filter((m) => !existingMemberIds.includes(m.userId))
      .map((m) => m.userId);
    setSelectedUserIds((prev) => {
      const next = new Set(prev);
      newIds.forEach((id) => next.add(id));
      return next;
    });
  };

  const handleSubmit = () => {
    onAdd(Array.from(selectedUserIds));
    handleClose();
  };

  const handleClose = () => {
    setSelectedUserIds(new Set());
    setSearch('');
    setSelectedTeamId('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('squad.addMembers')}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            select
            fullWidth
            size="small"
            value={selectedTeamId}
            onChange={(e) => {
              setSelectedTeamId(e.target.value);
              setSearch('');
            }}
            label={t('trainings.team')}
          >
            <MenuItem value="">
              <em>{t('squad.selectTeam')}</em>
            </MenuItem>
            {(teams ?? []).map((team: TeamDTO) => (
              <MenuItem key={team.id} value={team.id}>
                {team.name}
              </MenuItem>
            ))}
          </TextField>

          {selectedTeamId && (
            <>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  placeholder={t('common.search')}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  size="small"
                  fullWidth
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position="start">
                          <Search fontSize="small" />
                        </InputAdornment>
                      ),
                    },
                  }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Groups />}
                  onClick={handleSelectAllTeam}
                  sx={{ whiteSpace: 'nowrap' }}
                >
                  {t('squad.addEntireTeam')}
                </Button>
              </Stack>

              <Box
                sx={{
                  maxHeight: 300,
                  overflow: 'auto',
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                {filteredMembers.length === 0 ? (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ p: 2, textAlign: 'center' }}
                  >
                    {t('common.noResults')}
                  </Typography>
                ) : (
                  <List dense disablePadding>
                    {filteredMembers.map(
                      (member: TeamMemberDTO, i: number) => {
                        const isExisting = existingMemberIds.includes(
                          member.userId,
                        );
                        const isSelected = selectedUserIds.has(
                          member.userId,
                        );

                        return (
                          <Box key={member.userId}>
                            {i > 0 && <Divider />}
                            <ListItem disablePadding>
                              <ListItemButton
                                onClick={() =>
                                  !isExisting &&
                                  handleToggle(member.userId)
                                }
                                disabled={isExisting}
                              >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                  <Checkbox
                                    edge="start"
                                    checked={isSelected || isExisting}
                                    disabled={isExisting}
                                    tabIndex={-1}
                                    disableRipple
                                  />
                                </ListItemIcon>
                                <ListItemText
                                  primary={`${member.firstName} ${member.lastName}`}
                                  secondary={
                                    <Stack
                                      direction="row"
                                      spacing={0.5}
                                      alignItems="center"
                                    >
                                      <Chip
                                        label={t(`roles.${member.role}`)}
                                        size="small"
                                        variant="outlined"
                                        sx={{ height: 20, fontSize: 11 }}
                                      />
                                      {isExisting && (
                                        <Typography
                                          variant="caption"
                                          color="text.disabled"
                                        >
                                          {t('squad.alreadyInSquad')}
                                        </Typography>
                                      )}
                                    </Stack>
                                  }
                                />
                              </ListItemButton>
                            </ListItem>
                          </Box>
                        );
                      },
                    )}
                  </List>
                )}
              </Box>
            </>
          )}

          {selectedUserIds.size > 0 && (
            <Typography variant="body2" color="primary">
              {t('squad.selectedCount', { count: selectedUserIds.size })}
            </Typography>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={selectedUserIds.size === 0 || loading}
          startIcon={<PersonAdd />}
        >
          {loading
            ? t('common.loading')
            : t('squad.addMembers')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
