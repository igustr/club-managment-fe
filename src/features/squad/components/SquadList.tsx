import { useTranslation } from 'react-i18next';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  HourglassEmpty,
  PersonRemove,
} from '@mui/icons-material';
import type { SquadMemberDTO } from '@/types/squad.types';
import { AttendanceStatus } from '@/types/common.types';
import type { PlayerPosition } from '@/types/common.types';
import { positionColors } from '@/utils/roles';

interface SquadListProps {
  members: SquadMemberDTO[];
  onUpdateStatus?: (userId: string, status: AttendanceStatus) => void;
  onRemoveMember?: (userId: string) => void;
  updatingUserId?: string | null;
  canManage: boolean;
  onProfileClick?: (userId: string) => void;
}

const statusConfig: Record<
  AttendanceStatus,
  {
    color: 'success' | 'error' | 'default';
    icon: React.ReactNode;
    key: string;
  }
> = {
  [AttendanceStatus.CONFIRMED]: {
    color: 'success',
    icon: <CheckCircle fontSize="small" />,
    key: 'squad.confirmed',
  },
  [AttendanceStatus.DECLINED]: {
    color: 'error',
    icon: <Cancel fontSize="small" />,
    key: 'squad.declined',
  },
  [AttendanceStatus.PENDING]: {
    color: 'default',
    icon: <HourglassEmpty fontSize="small" />,
    key: 'squad.pending',
  },
};

export function SquadList({
  members,
  onUpdateStatus,
  onRemoveMember,
  updatingUserId,
  canManage,
  onProfileClick,
}: SquadListProps) {
  const { t } = useTranslation();

  const sorted = [...members].sort((a, b) => {
    const order = { CONFIRMED: 0, PENDING: 1, DECLINED: 2 };
    return (order[a.status] ?? 1) - (order[b.status] ?? 1);
  });

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t('attendance.name')}</TableCell>
            <TableCell>{t('attendance.role')}</TableCell>
            <TableCell>{t('attendance.position')}</TableCell>
            <TableCell>{t('attendance.status')}</TableCell>
            {canManage && (
              <TableCell align="right">{t('attendance.actions')}</TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((member) => {
            const config = statusConfig[member.status];
            const isUpdating = updatingUserId === member.userId;

            return (
              <TableRow key={member.id}>
                <TableCell
                  sx={
                    onProfileClick
                      ? {
                          cursor: 'pointer',
                          '&:hover': { color: 'primary.main' },
                        }
                      : undefined
                  }
                  onClick={
                    onProfileClick
                      ? () => onProfileClick(member.userId)
                      : undefined
                  }
                >
                  {member.firstName} {member.lastName}
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`roles.${member.role}`)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {member.position ? (
                    <Chip
                      label={t(`positions.${member.position}`)}
                      size="small"
                      sx={{
                        bgcolor:
                          positionColors[member.position as PlayerPosition] + '1A',
                        color:
                          positionColors[member.position as PlayerPosition],
                        fontWeight: 600,
                      }}
                    />
                  ) : (
                    '—'
                  )}
                </TableCell>
                <TableCell>
                  <Chip
                    icon={config.icon as React.ReactElement}
                    label={t(config.key)}
                    size="small"
                    color={config.color}
                    variant="outlined"
                  />
                </TableCell>
                {canManage && (
                  <TableCell align="right">
                    {isUpdating ? (
                      <CircularProgress size={20} />
                    ) : (
                      <>
                        {member.status !== AttendanceStatus.CONFIRMED && (
                          <Tooltip title={t('attendance.markConfirmed')}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                onUpdateStatus?.(
                                  member.userId,
                                  AttendanceStatus.CONFIRMED,
                                )
                              }
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {member.status !== AttendanceStatus.DECLINED && (
                          <Tooltip title={t('attendance.markDeclined')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                onUpdateStatus?.(
                                  member.userId,
                                  AttendanceStatus.DECLINED,
                                )
                              }
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title={t('squad.removeMember')}>
                          <IconButton
                            size="small"
                            onClick={() =>
                              onRemoveMember?.(member.userId)
                            }
                          >
                            <PersonRemove fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
