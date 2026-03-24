import { useState, useCallback } from 'react';
import { Box, Typography, Tooltip } from '@mui/material';
import { FitnessCenter, SportsSoccer } from '@mui/icons-material';
import { ROW_HEIGHT } from './PortionGrid';
import { formatTime } from '@/utils/date';

interface TimelineBlockProps {
  id: string;
  type: 'training' | 'game';
  label: string;
  startTime: string;
  endTime: string;
  rowStart: number;
  rowSpan: number;
  color: string;
  left: number;
  width: number;
  isDraggable: boolean;
  pixelsPerMinute: number;
  onDragEnd?: (id: string, deltaMinutes: number) => void;
  onClick: () => void;
  isCancelled?: boolean;
}

export function TimelineBlock({
  id,
  type,
  label,
  startTime,
  endTime,
  rowStart,
  rowSpan,
  color,
  left,
  width,
  isDraggable,
  pixelsPerMinute,
  onDragEnd,
  onClick,
  isCancelled,
}: TimelineBlockProps) {
  const [dragDelta, setDragDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggable || isCancelled) return;
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      setIsDragging(true);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const delta = moveEvent.clientX - startX;
        setDragDelta(delta);
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);

        const delta = upEvent.clientX - startX;
        const deltaMinutes = Math.round(delta / pixelsPerMinute);
        // Snap to 15 minutes
        const snappedDelta =
          Math.round(deltaMinutes / 15) * 15;

        setIsDragging(false);
        setDragDelta(0);

        if (Math.abs(snappedDelta) >= 15 && onDragEnd) {
          onDragEnd(id, snappedDelta);
        }
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    },
    [isDraggable, isCancelled, pixelsPerMinute, onDragEnd, id],
  );

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;
      e.stopPropagation();
      onClick();
    },
    [isDragging, onClick],
  );

  const top = rowStart * ROW_HEIGHT + 1;
  const height = rowSpan * ROW_HEIGHT - 2;
  const isSmall = height < 28 || width < 60;

  const tooltipContent = `${label} · ${formatTime(startTime)} – ${formatTime(endTime)}`;

  return (
    <Tooltip title={tooltipContent} placement="top" arrow>
      <Box
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        sx={{
          position: 'absolute',
          left: left + dragDelta,
          top,
          width: Math.max(width - 2, 4),
          height,
          bgcolor: isCancelled ? 'action.disabledBackground' : `${color}20`,
          border: '1px solid',
          borderColor: isCancelled ? 'action.disabled' : color,
          borderLeft: `3px solid ${isCancelled ? 'grey' : color}`,
          borderRadius: 0.5,
          overflow: 'hidden',
          cursor: isDraggable && !isCancelled ? (isDragging ? 'grabbing' : 'grab') : 'pointer',
          opacity: isCancelled ? 0.5 : 1,
          transition: isDragging ? 'none' : 'box-shadow 0.15s',
          boxShadow: isDragging ? 3 : 0,
          zIndex: isDragging ? 10 : 1,
          userSelect: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          px: 0.5,
          '&:hover': {
            boxShadow: isDragging ? 3 : 1,
            bgcolor: isCancelled ? 'action.disabledBackground' : `${color}30`,
          },
        }}
      >
        {!isSmall && (
          type === 'game' ? (
            <SportsSoccer sx={{ fontSize: 14, color, flexShrink: 0 }} />
          ) : (
            <FitnessCenter sx={{ fontSize: 14, color, flexShrink: 0 }} />
          )
        )}
        <Typography
          variant="caption"
          sx={{
            fontWeight: 600,
            fontSize: isSmall ? 9 : 11,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            color: isCancelled ? 'text.disabled' : 'text.primary',
          }}
        >
          {label}
        </Typography>
        {!isSmall && width > 100 && (
          <Typography
            variant="caption"
            sx={{
              fontSize: 10,
              color: 'text.secondary',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {formatTime(startTime)}–{formatTime(endTime)}
          </Typography>
        )}
      </Box>
    </Tooltip>
  );
}
