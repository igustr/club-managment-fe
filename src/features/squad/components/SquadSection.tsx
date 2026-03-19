import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Divider,
  Button,
  Stack,
} from '@mui/material';
import { PersonAdd } from '@mui/icons-material';
import {
  useGameSquadSummary,
  useUpdateGameSquadStatus,
  useAddGameSquadMembers,
  useRemoveGameSquadMember,
  useGameSquad,
} from '@/api/game-squad.api';
import {
  useTournamentSquadSummary,
  useUpdateTournamentSquadStatus,
  useAddTournamentSquadMembers,
  useRemoveTournamentSquadMember,
  useTournamentSquad,
} from '@/api/tournament-squad.api';
import { useChildren } from '@/api/user.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { SquadSummary } from './SquadSummary';
import { SquadList } from './SquadList';
import { PlayerSquadCard } from './PlayerSquadCard';
import { AddSquadMembersDialog } from './AddSquadMembersDialog';
import { AttendanceStatus } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface SquadSectionProps {
  entityType: 'game' | 'tournament';
  entityId: string;
}

export function SquadSection({ entityType, entityId }: SquadSectionProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const user = useAuthStore((state) => state.user);
  const { canViewAttendanceSummary, isPlayer, isParent } = usePermissions();

  const navigate = useNavigate();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  // Use the right hooks based on entity type
  const isGame = entityType === 'game';

  const { data: gameSummary, isLoading: gameSummaryLoading } =
    useGameSquadSummary(
      isGame && canViewAttendanceSummary ? clubId : null,
      isGame && canViewAttendanceSummary ? entityId : undefined,
    );

  const { data: tournamentSummary, isLoading: tournamentSummaryLoading } =
    useTournamentSquadSummary(
      !isGame && canViewAttendanceSummary ? clubId : null,
      !isGame && canViewAttendanceSummary ? entityId : undefined,
    );

  const { data: gameSquadList } = useGameSquad(
    isGame && (isPlayer || isParent) ? clubId : null,
    isGame && (isPlayer || isParent) ? entityId : undefined,
  );

  const { data: tournamentSquadList } = useTournamentSquad(
    !isGame && (isPlayer || isParent) ? clubId : null,
    !isGame && (isPlayer || isParent) ? entityId : undefined,
  );

  const { data: children } = useChildren(
    isParent ? clubId : null,
    isParent ? user?.id : undefined,
  );

  const gameStatusMutation = useUpdateGameSquadStatus(
    clubId!,
    entityId,
  );
  const tournamentStatusMutation = useUpdateTournamentSquadStatus(
    clubId!,
    entityId,
  );
  const gameAddMutation = useAddGameSquadMembers(clubId!, entityId);
  const tournamentAddMutation = useAddTournamentSquadMembers(
    clubId!,
    entityId,
  );
  const gameRemoveMutation = useRemoveGameSquadMember(clubId!, entityId);
  const tournamentRemoveMutation = useRemoveTournamentSquadMember(
    clubId!,
    entityId,
  );

  const summary = isGame ? gameSummary : tournamentSummary;
  const summaryLoading = isGame
    ? gameSummaryLoading
    : tournamentSummaryLoading;
  const squadList = isGame ? gameSquadList : tournamentSquadList;
  const statusMutation = isGame
    ? gameStatusMutation
    : tournamentStatusMutation;
  const addMutation = isGame ? gameAddMutation : tournamentAddMutation;
  const removeMutation = isGame
    ? gameRemoveMutation
    : tournamentRemoveMutation;

  const handleUpdateStatus = async (
    userId: string,
    status: AttendanceStatus,
  ) => {
    setUpdatingUserId(userId);
    try {
      await statusMutation.mutateAsync({ userId, data: { status } });
      toast.success(t('squad.updateSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleAddMembers = async (userIds: string[]) => {
    try {
      await addMutation.mutateAsync({ userIds });
      toast.success(t('squad.addSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMutation.mutateAsync(userId);
      toast.success(t('squad.removeSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const existingMemberIds =
    summary?.squadMembers.map((m) => m.userId) ?? [];

  // Admin/Coach view
  if (canViewAttendanceSummary) {
    if (summaryLoading) {
      return (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('squad.title')}
          </Typography>
          <Box
            sx={{ display: 'flex', justifyContent: 'center', py: 3 }}
          >
            <CircularProgress size={24} />
          </Box>
        </Paper>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="subtitle1" fontWeight={600}>
            {t('squad.title')}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<PersonAdd />}
            onClick={() => setAddDialogOpen(true)}
          >
            {t('squad.addMembers')}
          </Button>
        </Stack>
        {summary ? (
          <>
            <SquadSummary summary={summary} />
            <Divider sx={{ my: 2 }} />
            <SquadList
              members={summary.squadMembers}
              onUpdateStatus={handleUpdateStatus}
              onRemoveMember={handleRemoveMember}
              updatingUserId={updatingUserId}
              canManage
              onProfileClick={(userId) => navigate(`/members/${userId}`)}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('squad.noMembers')}
          </Typography>
        )}
        <AddSquadMembersDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          onAdd={handleAddMembers}
          existingMemberIds={existingMemberIds}
          loading={addMutation.isPending}
        />
      </Paper>
    );
  }

  // Player view
  if (isPlayer && user) {
    const ownMember = squadList?.find((m) => m.userId === user.id);

    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('squad.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t('squad.playerHint')}
        </Typography>
        <PlayerSquadCard
          member={ownMember}
          onConfirm={() =>
            handleUpdateStatus(user.id, AttendanceStatus.CONFIRMED)
          }
          onDecline={() =>
            handleUpdateStatus(user.id, AttendanceStatus.DECLINED)
          }
          loading={statusMutation.isPending}
        />
      </Paper>
    );
  }

  // Parent view
  if (isParent && user && children) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('squad.title')}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2 }}
        >
          {t('squad.parentHint')}
        </Typography>
        {children.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('attendance.noChildren')}
          </Typography>
        ) : (
          <Box
            sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            {children.map((child) => (
              <PlayerSquadCard
                key={child.id}
                label={`${child.firstName} ${child.lastName}`}
                member={squadList?.find(
                  (m) => m.userId === child.id,
                )}
                onConfirm={() =>
                  handleUpdateStatus(
                    child.id,
                    AttendanceStatus.CONFIRMED,
                  )
                }
                onDecline={() =>
                  handleUpdateStatus(
                    child.id,
                    AttendanceStatus.DECLINED,
                  )
                }
                loading={
                  statusMutation.isPending &&
                  updatingUserId === child.id
                }
              />
            ))}
          </Box>
        )}
      </Paper>
    );
  }

  return null;
}
