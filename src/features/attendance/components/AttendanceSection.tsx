import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, CircularProgress, Divider } from '@mui/material';
import { useMyAttendance, useAttendanceSummary, useUpdateAttendance } from '@/api/attendance.api';
import { useChildren } from '@/api/user.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { AttendanceSummary } from './AttendanceSummary';
import { AttendanceList } from './AttendanceList';
import { PlayerAttendanceCard } from './PlayerAttendanceCard';
import { AttendanceStatus } from '@/types/common.types';
import type { UserDTO } from '@/types/auth.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

// Wrapper to call useMyAttendance hook per child
function ChildAttendanceRow({
  child,
  clubId,
  trainingId,
  onUpdateStatus,
  loading,
}: {
  child: UserDTO;
  clubId: string;
  trainingId: string;
  onUpdateStatus: (userId: string, status: AttendanceStatus) => void;
  loading: boolean;
}) {
  const { data: childAttendance } = useMyAttendance(clubId, trainingId, child.id);
  return (
    <PlayerAttendanceCard
      label={`${child.firstName} ${child.lastName}`}
      attendance={childAttendance ?? undefined}
      onConfirm={() => onUpdateStatus(child.id, AttendanceStatus.CONFIRMED)}
      onDecline={() => onUpdateStatus(child.id, AttendanceStatus.DECLINED)}
      loading={loading}
    />
  );
}

interface AttendanceSectionProps {
  trainingId: string;
}

export function AttendanceSection({ trainingId }: AttendanceSectionProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const user = useAuthStore((state) => state.user);
  const { canViewAttendanceSummary, isPlayer, isParent } = usePermissions();

  const navigate = useNavigate();
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Admin/Coach: fetch full summary (includes attendance list)
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(
    canViewAttendanceSummary ? clubId : null,
    canViewAttendanceSummary ? trainingId : undefined,
  );

  // Player: fetch own attendance status
  const { data: myAttendance } = useMyAttendance(
    isPlayer ? clubId : null,
    isPlayer ? trainingId : undefined,
  );

  // Parent: fetch children to show per-child attendance
  const { data: children } = useChildren(
    isParent ? clubId : null,
    isParent ? user?.id : undefined,
  );

  const updateMutation = useUpdateAttendance(clubId!, trainingId);

  const handleUpdateStatus = async (userId: string, status: AttendanceStatus) => {
    setUpdatingUserId(userId);
    try {
      await updateMutation.mutateAsync({ userId, data: { status } });
      toast.success(t('attendance.updateSuccess'));
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Admin/Coach view: full summary + list
  if (canViewAttendanceSummary) {
    if (summaryLoading) {
      return (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
            {t('trainings.attendance')}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        </Paper>
      );
    }

    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('trainings.attendance')}
        </Typography>
        {summary ? (
          <>
            <AttendanceSummary summary={summary} />
            <Divider sx={{ my: 2 }} />
            <AttendanceList
              attendances={summary.attendances}
              onUpdateStatus={handleUpdateStatus}
              updatingUserId={updatingUserId}
              canManage
              onProfileClick={(userId) => navigate(`/members/${userId}`)}
            />
          </>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('attendance.noData')}
          </Typography>
        )}
      </Paper>
    );
  }

  // Player view: own attendance confirm/decline
  if (isPlayer && user) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('trainings.attendance')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('attendance.playerHint')}
        </Typography>
        <PlayerAttendanceCard
          attendance={myAttendance ?? undefined}
          onConfirm={() => handleUpdateStatus(user.id, AttendanceStatus.CONFIRMED)}
          onDecline={() => handleUpdateStatus(user.id, AttendanceStatus.DECLINED)}
          loading={updateMutation.isPending}
        />
      </Paper>
    );
  }

  // Parent view: per-child attendance
  if (isParent && user && children) {
    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('trainings.attendance')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('attendance.parentHint')}
        </Typography>
        {children.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('attendance.noChildren')}
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {children.map((child) => (
              <ChildAttendanceRow
                key={child.id}
                child={child}
                clubId={clubId!}
                trainingId={trainingId}
                onUpdateStatus={handleUpdateStatus}
                loading={updateMutation.isPending && updatingUserId === child.id}
              />
            ))}
          </Box>
        )}
      </Paper>
    );
  }

  return null;
}
