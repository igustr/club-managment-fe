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
import { AttendanceStatus } from '@/types/common.types';

interface AttendanceListProps {
  attendances: AttendanceDTO[];
  onUpdateStatus?: (userId: string, status: AttendanceStatus) => void;
  updatingUserId?: string | null;
  canManage: boolean;
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
}: AttendanceListProps) {
  const { t } = useTranslation();

  const sorted = [...attendances].sort((a, b) => {
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
                <TableCell>
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
