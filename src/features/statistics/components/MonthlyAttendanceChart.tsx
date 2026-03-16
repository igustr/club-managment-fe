import { Paper, Typography, Box, Tooltip } from '@mui/material';
import type { MonthlyAttendanceDTO } from '@/types/statistics.types';

interface MonthlyAttendanceChartProps {
  title: string;
  data: MonthlyAttendanceDTO[];
}

export function MonthlyAttendanceChart({ title, data }: MonthlyAttendanceChartProps) {
  if (data.length === 0) return null;

  const maxAttendances = Math.max(...data.map((d) => d.totalAttendances), 1);

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 1,
          height: 160,
          px: 1,
        }}
      >
        {data.map((item) => {
          const barHeight = (item.totalAttendances / maxAttendances) * 140;
          const confirmedHeight =
            item.totalAttendances > 0
              ? (item.confirmedCount / item.totalAttendances) * barHeight
              : 0;

          return (
            <Tooltip
              key={item.month}
              title={`${item.month}: ${item.attendanceRate}% (${item.confirmedCount}/${item.totalAttendances})`}
              arrow
            >
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 40,
                    position: 'relative',
                    height: barHeight || 2,
                    borderRadius: '4px 4px 0 0',
                    bgcolor: 'divider',
                    overflow: 'hidden',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      width: '100%',
                      height: confirmedHeight,
                      bgcolor: 'primary.main',
                      borderRadius: '4px 4px 0 0',
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 10, writingMode: 'horizontal-tb' }}
                >
                  {item.month.slice(5)}
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          mt: 2,
          justifyContent: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: 'primary.main',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Confirmed
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: 0.5,
              bgcolor: 'divider',
            }}
          />
          <Typography variant="caption" color="text.secondary">
            Total
          </Typography>
        </Box>
      </Box>
    </Paper>
  );
}
