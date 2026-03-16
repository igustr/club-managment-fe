import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  ArrowBack,
  PersonAdd,
  Edit,
  Delete,
  PersonRemove,
} from '@mui/icons-material';
import {
  useTeam,
  useTeamMembers,
  useDeleteTeam,
  useRemoveTeamMember,
} from '@/api/team.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { clubRoleColors } from '@/utils/roles';
import type { ClubRole } from '@/types/common.types';
import type { TeamDTO } from '@/types/team.types';
import { TeamFormDialog } from './components/TeamFormDialog';
import { AddMemberDialog } from './components/AddMemberDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useTeamStatistics } from '@/api/statistics.api';
import { formatDate } from '@/utils/date';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function TeamDetailPage() {
  const { t } = useTranslation();
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const clubId = useAuthStore((s) => s.user?.clubId);
  const { isClubAdmin, canViewStatistics } = usePermissions();

  const [editOpen, setEditOpen] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [removeMember, setRemoveMember] = useState<{
    userId: string;
    name: string;
  } | null>(null);

  const { data: team, isLoading: teamLoading } = useTeam(
    clubId ?? null,
    teamId,
  );
  const { data: teamStats } = useTeamStatistics(
    canViewStatistics ? (clubId ?? null) : null,
    canViewStatistics ? (teamId ?? null) : null,
  );

  const { data: members, isLoading: membersLoading } = useTeamMembers(
    clubId ?? null,
    teamId,
  );

  const deleteTeamMutation = useDeleteTeam(clubId ?? '');
  const removeMemberMutation = useRemoveTeamMember(
    clubId ?? '',
    teamId ?? '',
  );

  const handleDeleteTeam = async () => {
    if (!teamId) return;
    try {
      await deleteTeamMutation.mutateAsync(teamId);
      toast.success(t('teams.deleteSuccess'));
      navigate('/teams');
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleRemoveMember = async () => {
    if (!removeMember) return;
    try {
      await removeMemberMutation.mutateAsync(removeMember.userId);
      toast.success(t('teams.removeMemberSuccess'));
      setRemoveMember(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (teamLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!team) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          {t('error.notFound')}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate('/teams')}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h5" fontWeight={700}>
              {team.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              {team.ageGroup && (
                <Chip
                  label={team.ageGroup}
                  size="small"
                  variant="outlined"
                />
              )}
              {team.season && (
                <Chip
                  label={team.season}
                  size="small"
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
        </Stack>
        {isClubAdmin && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditOpen(true)}
            >
              {t('common.edit')}
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Delete />}
              onClick={() => setDeleteConfirm(true)}
            >
              {t('common.delete')}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Team statistics */}
      {canViewStatistics && teamStats && teamStats.totalTrainings > 0 && (
        <Paper
          variant="outlined"
          sx={{
            p: 2.5,
            mb: 3,
            display: 'flex',
            gap: 4,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('statistics.totalTrainings')}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {teamStats.totalTrainings}
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('statistics.averageAttendance')}
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color={
                teamStats.averageAttendanceRate >= 75
                  ? 'success.main'
                  : teamStats.averageAttendanceRate >= 50
                    ? 'warning.main'
                    : 'error.main'
              }
            >
              {teamStats.averageAttendanceRate}%
            </Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary">
              {t('statistics.memberCount')}
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {teamStats.memberCount}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Members */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="subtitle1" fontWeight={600}>
          {t('teams.members')} ({members?.length ?? 0})
        </Typography>
        {isClubAdmin && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAdd />}
            onClick={() => setAddMemberOpen(true)}
          >
            {t('teams.addMember')}
          </Button>
        )}
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('teams.memberName')}</TableCell>
              <TableCell>{t('teams.memberEmail')}</TableCell>
              <TableCell>{t('teams.memberRole')}</TableCell>
              <TableCell>{t('teams.joinedDate')}</TableCell>
              {isClubAdmin && (
                <TableCell align="right" sx={{ width: 60 }} />
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {membersLoading ? (
              <TableRow>
                <TableCell
                  colSpan={isClubAdmin ? 5 : 4}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : !members || members.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={isClubAdmin ? 5 : 4}
                  align="center"
                  sx={{ py: 6 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('teams.noMembers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <Typography fontWeight={500}>
                      {member.firstName} {member.lastName}
                    </Typography>
                  </TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`roles.${member.role}`)}
                      size="small"
                      sx={{
                        bgcolor:
                          clubRoleColors[member.role as ClubRole] + '1A',
                        color: clubRoleColors[member.role as ClubRole],
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>{formatDate(member.joinedDate)}</TableCell>
                  {isClubAdmin && (
                    <TableCell align="right">
                      <Tooltip title={t('teams.removeMember')}>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() =>
                            setRemoveMember({
                              userId: member.userId,
                              name: `${member.firstName} ${member.lastName}`,
                            })
                          }
                        >
                          <PersonRemove fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogs */}
      {clubId && (
        <>
          <TeamFormDialog
            open={editOpen}
            clubId={clubId}
            onClose={() => setEditOpen(false)}
            team={team as TeamDTO}
          />
          <AddMemberDialog
            open={addMemberOpen}
            clubId={clubId}
            teamId={teamId!}
            existingMembers={members ?? []}
            onClose={() => setAddMemberOpen(false)}
          />
        </>
      )}

      <ConfirmDialog
        open={deleteConfirm}
        title={t('teams.deleteTeam')}
        message={t('teams.deleteConfirm', { name: team.name })}
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeleteConfirm(false)}
        loading={deleteTeamMutation.isPending}
      />

      <ConfirmDialog
        open={!!removeMember}
        title={t('teams.removeMember')}
        message={t('teams.removeMemberConfirm', {
          name: removeMember?.name,
        })}
        onConfirm={handleRemoveMember}
        onCancel={() => setRemoveMember(null)}
        loading={removeMemberMutation.isPending}
      />
    </Box>
  );
}
