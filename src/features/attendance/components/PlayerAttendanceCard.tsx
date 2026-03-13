import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { AttendanceStatus } from '@/types/common.types';
import type { AttendanceDTO } from '@/types/attendance.types';

interface PlayerAttendanceCardProps {
  attendance?: AttendanceDTO;
  onConfirm: () => void;
  onDecline: () => void;
  loading: boolean;
  label?: string;
}

export function PlayerAttendanceCard({
  attendance,
  onConfirm,
  onDecline,
  loading,
  label,
}: PlayerAttendanceCardProps) {
  const { t } = useTranslation();
  const [optimisticStatus, setOptimisticStatus] = useState<AttendanceStatus | null>(null);

  const currentStatus = optimisticStatus ?? attendance?.status ?? AttendanceStatus.PENDING;

  const handleConfirm = () => {
    setOptimisticStatus(AttendanceStatus.CONFIRMED);
    onConfirm();
  };

  const handleDecline = () => {
    setOptimisticStatus(AttendanceStatus.DECLINED);
    onDecline();
  };

  return (
    <Box>
      {label && (
        <Typography variant="body2" fontWeight={500} sx={{ mb: 1 }}>
          {label}
        </Typography>
      )}
      <Stack direction="row" spacing={1.5} alignItems="center">
        {currentStatus === AttendanceStatus.CONFIRMED ? (
          <>
            <Chip
              icon={<CheckCircle />}
              label={t('attendance.confirmed')}
              color="success"
              variant="outlined"
            />
            <Button
              size="small"
              color="error"
              variant="outlined"
              onClick={handleDecline}
              disabled={loading}
            >
              {t('attendance.decline')}
            </Button>
          </>
        ) : currentStatus === AttendanceStatus.DECLINED ? (
          <>
            <Chip
              icon={<Cancel />}
              label={t('attendance.declined')}
              color="error"
              variant="outlined"
            />
            <Button
              size="small"
              color="success"
              variant="outlined"
              onClick={handleConfirm}
              disabled={loading}
            >
              {t('attendance.confirm')}
            </Button>
          </>
        ) : (
          <>
            <Chip label={t('attendance.pending')} variant="outlined" />
            <Button
              size="small"
              color="success"
              variant="contained"
              startIcon={<CheckCircle />}
              onClick={handleConfirm}
              disabled={loading}
            >
              {t('attendance.confirm')}
            </Button>
            <Button
              size="small"
              color="error"
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleDecline}
              disabled={loading}
            >
              {t('attendance.decline')}
            </Button>
          </>
        )}
      </Stack>
    </Box>
  );
}
