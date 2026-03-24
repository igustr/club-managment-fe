import { Box, Typography } from '@mui/material';

const ROW_HEIGHT = 32;
const TOTAL_ROWS = 8;
const LABEL_WIDTH = 60;


interface PortionGridProps {
  startHour: number;
  endHour: number;
  pixelsPerMinute: number;
  children?: React.ReactNode;
}

export function PortionGrid({
  startHour,
  endHour,
  pixelsPerMinute,
  children,
}: PortionGridProps) {
  const totalWidth = (endHour - startHour) * 60 * pixelsPerMinute;
  const totalHeight = TOTAL_ROWS * ROW_HEIGHT;
  const hours = endHour - startHour;

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Portion labels */}
      <Box
        sx={{
          width: LABEL_WIDTH,
          flexShrink: 0,
          position: 'relative',
          height: totalHeight,
        }}
      >
        {Array.from({ length: TOTAL_ROWS }, (_, i) => (
          <Box
            key={i}
            sx={{
              position: 'absolute',
              top: i * ROW_HEIGHT,
              left: 0,
              right: 0,
              height: ROW_HEIGHT,
              borderBottom: i < TOTAL_ROWS - 1 ? '1px solid' : 'none',
              borderColor: i === 3 ? 'divider' : 'action.hover',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {i === 0 && (
              <Typography variant="caption" color="text.disabled" sx={{ fontSize: 10 }}>
                1/8
              </Typography>
            )}
          </Box>
        ))}
        {/* Show major portion divider labels */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 2,
            height: totalHeight / 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
            1/2
          </Typography>
        </Box>
        <Box
          sx={{
            position: 'absolute',
            top: totalHeight / 2,
            left: 2,
            height: totalHeight / 2,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: 10, writingMode: 'vertical-lr', transform: 'rotate(180deg)' }}>
            1/2
          </Typography>
        </Box>
      </Box>

      {/* Grid area */}
      <Box
        sx={{
          position: 'relative',
          width: totalWidth,
          height: totalHeight,
          overflow: 'hidden',
        }}
      >
        {/* Hour column lines */}
        {Array.from({ length: hours + 1 }, (_, i) => (
          <Box
            key={`col-${i}`}
            sx={{
              position: 'absolute',
              left: i * 60 * pixelsPerMinute,
              top: 0,
              bottom: 0,
              width: 1,
              bgcolor: i === 0 || i === hours ? 'divider' : 'action.hover',
            }}
          />
        ))}
        {/* Half-hour lines */}
        {Array.from({ length: hours }, (_, i) => (
          <Box
            key={`col-half-${i}`}
            sx={{
              position: 'absolute',
              left: (i + 0.5) * 60 * pixelsPerMinute,
              top: 0,
              bottom: 0,
              width: 1,
              bgcolor: 'action.hover',
              opacity: 0.5,
            }}
          />
        ))}
        {/* Row lines */}
        {Array.from({ length: TOTAL_ROWS - 1 }, (_, i) => (
          <Box
            key={`row-${i}`}
            sx={{
              position: 'absolute',
              top: (i + 1) * ROW_HEIGHT,
              left: 0,
              right: 0,
              height: 1,
              bgcolor: i === 3 ? 'divider' : 'action.hover',
            }}
          />
        ))}
        {/* Border */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            border: '1px solid',
            borderColor: 'divider',
            pointerEvents: 'none',
          }}
        />
        {/* Session blocks rendered as children */}
        {children}
      </Box>
    </Box>
  );
}

export { ROW_HEIGHT, TOTAL_ROWS, LABEL_WIDTH };
