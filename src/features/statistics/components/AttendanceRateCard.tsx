import { Box, CircularProgress, Typography, Paper } from '@mui/material';

interface AttendanceRateCardProps {
  title: string;
  rate: number;
  size?: number;
}

export function AttendanceRateCard({ title, rate, size = 120 }: AttendanceRateCardProps) {
  const color =
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
        {title}
      </Typography>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={100}
          size={size}
          thickness={4}
          sx={{ color: 'divider', position: 'absolute' }}
        />
        <CircularProgress
          variant="determinate"
          value={rate}
          size={size}
          thickness={4}
          sx={{ color }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            {rate}%
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
