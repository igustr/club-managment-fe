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
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import type { AttendanceDTO } from '@/types/attendance.types';
import type { PlayerPosition } from '@/types/common.types';
import { positionColors } from '@/utils/roles';
import { AttendanceStatus } from '@/types/common.types';

interface AttendanceListProps {
  attendances: AttendanceDTO[];
  onUpdateStatus?: (userId: string, status: AttendanceStatus) => void;
  updatingUserId?: string | null;
  canManage: boolean;
  onProfileClick?: (userId: string) => void;
}

const statusConfig: Record<
  AttendanceStatus,
  { color: 'success' | 'error' | 'default'; icon: React.ReactNode; key: string }
> = {
  [AttendanceStatus.CONFIRMED]: {
    color: 'success',
    icon: <CheckCircle fontSize="small" />,
    key: 'attendance.confirmed',
  },
  [AttendanceStatus.DECLINED]: {
    color: 'error',
    icon: <Cancel fontSize="small" />,
    key: 'attendance.declined',
  },
  [AttendanceStatus.PENDING]: {
    color: 'default',
    icon: <HourglassEmpty fontSize="small" />,
    key: 'attendance.pending',
  },
};

export function AttendanceList({
  attendances,
  onUpdateStatus,
  updatingUserId,
  canManage,
  onProfileClick,
}: AttendanceListProps) {
  const { t } = useTranslation();

  const sorted = [...attendances].sort((a, b) => {
    const order = { CONFIRMED: 0, DECLINED: 1, PENDING: 2 };
    return (order[a.status] ?? 2) - (order[b.status] ?? 2);
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
            {canManage && <TableCell align="right">{t('attendance.actions')}</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {sorted.map((att) => {
            const config = statusConfig[att.status];
            const isUpdating = updatingUserId === att.userId;

            return (
              <TableRow key={att.id}>
                <TableCell
                  sx={onProfileClick ? {
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  } : undefined}
                  onClick={onProfileClick ? () => onProfileClick(att.userId) : undefined}
                >
                  {att.firstName} {att.lastName}
                </TableCell>
                <TableCell>
                  <Chip
                    label={t(`roles.${att.role}`)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {att.position ? (
                    <Chip
                      label={t(`positions.${att.position}`)}
                      size="small"
                      sx={{
                        bgcolor:
                          positionColors[att.position as PlayerPosition] + '1A',
                        color:
                          positionColors[att.position as PlayerPosition],
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
                        {att.status !== AttendanceStatus.CONFIRMED && (
                          <Tooltip title={t('attendance.markConfirmed')}>
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() =>
                                onUpdateStatus?.(att.userId, AttendanceStatus.CONFIRMED)
                              }
                            >
                              <CheckCircle fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {att.status !== AttendanceStatus.DECLINED && (
                          <Tooltip title={t('attendance.markDeclined')}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() =>
                                onUpdateStatus?.(att.userId, AttendanceStatus.DECLINED)
                              }
                            >
                              <Cancel fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
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
