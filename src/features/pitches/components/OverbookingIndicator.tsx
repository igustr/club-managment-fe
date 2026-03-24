import { Box } from '@mui/material';
import { ROW_HEIGHT, TOTAL_ROWS } from './PortionGrid';
import type { OverbookingRange } from '../utils/timeline';

interface OverbookingIndicatorProps {
  ranges: OverbookingRange[];
  startHour: number;
  pixelsPerMinute: number;
}

export function OverbookingIndicator({
  ranges,
  startHour,
  pixelsPerMinute,
}: OverbookingIndicatorProps) {
  if (ranges.length === 0) return null;

  return (
    <>
      {ranges.map((range, i) => {
        const left = (range.startMinutes - startHour * 60) * pixelsPerMinute;
        const width =
          (range.endMinutes - range.startMinutes) * pixelsPerMinute;
        return (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              left,
              top: 0,
              width,
              height: TOTAL_ROWS * ROW_HEIGHT,
              bgcolor: 'error.main',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        );
      })}
    </>
  );
}
