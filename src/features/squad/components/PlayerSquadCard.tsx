import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, Stack, Typography, Chip } from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { AttendanceStatus } from '@/types/common.types';
import type { SquadMemberDTO } from '@/types/squad.types';

interface PlayerSquadCardProps {
  member?: SquadMemberDTO;
  onConfirm: () => void;
  onDecline: () => void;
  loading: boolean;
  label?: string;
}

export function PlayerSquadCard({
  member,
  onConfirm,
  onDecline,
  loading,
  label,
}: PlayerSquadCardProps) {
  const { t } = useTranslation();
  const [optimisticStatus, setOptimisticStatus] =
    useState<AttendanceStatus | null>(null);

  const currentStatus =
    optimisticStatus ?? member?.status ?? AttendanceStatus.PENDING;

  const handleConfirm = () => {
    setOptimisticStatus(AttendanceStatus.CONFIRMED);
    onConfirm();
  };

  const handleDecline = () => {
    setOptimisticStatus(AttendanceStatus.DECLINED);
    onDecline();
  };

  if (!member) {
    return null;
  }

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
              label={t('squad.confirmed')}
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
              label={t('squad.declined')}
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
            <Chip label={t('squad.pending')} variant="outlined" />
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
