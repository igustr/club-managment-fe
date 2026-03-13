import { useTranslation } from 'react-i18next';
import { Box, Typography, LinearProgress, Stack, Chip } from '@mui/material';
import { CheckCircle, Cancel, HourglassEmpty } from '@mui/icons-material';
import type { AttendanceSummaryDTO } from '@/types/attendance.types';

interface AttendanceSummaryProps {
  summary: AttendanceSummaryDTO;
}

export function AttendanceSummary({ summary }: AttendanceSummaryProps) {
  const { t } = useTranslation();
  const { total, confirmed, declined, pending } = summary;

  const confirmedPct = total > 0 ? (confirmed / total) * 100 : 0;
  const declinedPct = total > 0 ? (declined / total) * 100 : 0;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
        <Chip
          icon={<CheckCircle />}
          label={`${confirmed} ${t('attendance.confirmed')}`}
          size="small"
          color="success"
          variant="outlined"
        />
        <Chip
          icon={<Cancel />}
          label={`${declined} ${t('attendance.declined')}`}
          size="small"
          color="error"
          variant="outlined"
        />
        <Chip
          icon={<HourglassEmpty />}
          label={`${pending} ${t('attendance.pending')}`}
          size="small"
          variant="outlined"
        />
        <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
          {t('attendance.total')}: {total}
        </Typography>
      </Stack>

      {/* Stacked progress bar */}
      <Box sx={{ position: 'relative', height: 8, borderRadius: 1, bgcolor: 'grey.200' }}>
        {/* Confirmed (green) */}
        <LinearProgress
          variant="determinate"
          value={confirmedPct}
          color="success"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: 1,
            bgcolor: 'transparent',
            '& .MuiLinearProgress-bar': { borderRadius: 1 },
          }}
        />
        {/* Declined (red) overlay */}
        {declined > 0 && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: `${confirmedPct}%`,
              width: `${declinedPct}%`,
              height: '100%',
              bgcolor: 'error.main',
              borderRadius: declinedPct + confirmedPct >= 100 ? '0 4px 4px 0' : 0,
            }}
          />
        )}
      </Box>
    </Box>
  );
}
