import { Box, Typography } from '@mui/material';

interface TimeAxisProps {
  startHour: number;
  endHour: number;
  pixelsPerMinute: number;
}

export function TimeAxis({ startHour, endHour, pixelsPerMinute }: TimeAxisProps) {
  const hours: number[] = [];
  for (let h = startHour; h <= endHour; h++) {
    hours.push(h);
  }

  return (
    <Box sx={{ position: 'relative', height: 28, ml: '60px' }}>
      {hours.map((h) => {
        const left = (h - startHour) * 60 * pixelsPerMinute;
        return (
          <Box key={h} sx={{ position: 'absolute', left }}>
            <Box
              sx={{
                width: 1,
                height: 8,
                bgcolor: 'divider',
                position: 'absolute',
                bottom: 0,
              }}
            />
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                position: 'absolute',
                bottom: 10,
                transform: 'translateX(-50%)',
                fontSize: 11,
                whiteSpace: 'nowrap',
              }}
            >
              {`${String(h).padStart(2, '0')}:00`}
            </Typography>
          </Box>
        );
      })}
      {/* Half-hour ticks */}
      {hours.slice(0, -1).map((h) => {
        const left = (h - startHour + 0.5) * 60 * pixelsPerMinute;
        return (
          <Box
            key={`${h}-30`}
            sx={{
              position: 'absolute',
              left,
              bottom: 0,
              width: 1,
              height: 4,
              bgcolor: 'divider',
            }}
          />
        );
      })}
    </Box>
  );
}
