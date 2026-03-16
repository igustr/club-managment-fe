import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, CircularProgress, Divider } from '@mui/material';
import { useAttendanceList, useAttendanceSummary, useUpdateAttendance } from '@/api/attendance.api';
import { useChildren } from '@/api/user.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { AttendanceSummary } from './AttendanceSummary';
import { AttendanceList } from './AttendanceList';
import { PlayerAttendanceCard } from './PlayerAttendanceCard';
import { AttendanceStatus } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface AttendanceSectionProps {
  trainingId: string;
}

export function AttendanceSection({ trainingId }: AttendanceSectionProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const user = useAuthStore((state) => state.user);
  const { canViewAttendanceSummary, isPlayer, isParent } = usePermissions();

  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  // Admin/Coach: fetch full summary (includes attendance list)
  const { data: summary, isLoading: summaryLoading } = useAttendanceSummary(
    canViewAttendanceSummary ? clubId : null,
    canViewAttendanceSummary ? trainingId : undefined,
  );

  // Player/Parent: fetch attendance list to find own/children's status
  const { data: attendanceList } = useAttendanceList(
    isPlayer || isParent ? clubId : null,
    isPlayer || isParent ? trainingId : undefined,
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
    const ownAttendance = attendanceList?.find((a) => a.userId === user.id);

    return (
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('trainings.attendance')}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {t('attendance.playerHint')}
        </Typography>
        <PlayerAttendanceCard
          attendance={ownAttendance}
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
              <PlayerAttendanceCard
                key={child.id}
                label={`${child.firstName} ${child.lastName}`}
                attendance={attendanceList?.find((a) => a.userId === child.id)}
                onConfirm={() => handleUpdateStatus(child.id, AttendanceStatus.CONFIRMED)}
                onDecline={() => handleUpdateStatus(child.id, AttendanceStatus.DECLINED)}
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
