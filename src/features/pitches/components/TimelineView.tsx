import { useMemo, useRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography } from '@mui/material';
import { TimeAxis } from './TimeAxis';
import { PortionGrid } from './PortionGrid';
import { TimelineBlock } from './TimelineBlock';
import { OverbookingIndicator } from './OverbookingIndicator';
import {
  timeToPixel,
  layoutSessions,
  findOverbookingRanges,
  type TimeSession,
} from '../utils/timeline';
import type { TrainingSessionDTO } from '@/types/training.types';
import type { GameDTO } from '@/types/game.types';
import { TrainingSessionStatus } from '@/types/common.types';
import { VenueType } from '@/types/common.types';
import dayjs from 'dayjs';

// Team colors palette for differentiating teams
const TEAM_COLORS = [
  '#1976d2', // blue
  '#388e3c', // green
  '#7b1fa2', // purple
  '#c62828', // red
  '#00838f', // teal
  '#e65100', // orange
  '#4527a0', // deep purple
  '#2e7d32', // dark green
];

const GAME_COLOR = '#F59E0B'; // amber

interface TimelineViewProps {
  trainings: TrainingSessionDTO[];
  games: GameDTO[];
  date: string;
  startHour: number;
  endHour: number;
  canDrag: boolean;
  onTrainingDragEnd: (trainingId: string, deltaMinutes: number) => void;
  onBlockClick: (type: 'training' | 'game', id: string) => void;
}

export function TimelineView({
  trainings,
  games,
  date,
  startHour,
  endHour,
  canDrag,
  onTrainingDragEnd,
  onBlockClick,
}: TimelineViewProps) {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(800);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        // Subtract label width (60px)
        setContainerWidth(Math.max(entry.contentRect.width - 60, 200));
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const totalMinutes = (endHour - startHour) * 60;
  const pixelsPerMinute = containerWidth / totalMinutes;

  // Build team color mapping
  const teamColorMap = useMemo(() => {
    const map = new Map<string, string>();
    const uniqueTeamIds: string[] = [
      ...new Set(trainings.map((tr) => tr.teamId)),
    ];
    uniqueTeamIds.forEach((id, i) => {
      map.set(id, TEAM_COLORS[i % TEAM_COLORS.length]!);
    });
    return map;
  }, [trainings]);

  // Filter to non-cancelled trainings for layout, but keep cancelled for display
  const activeSessions: TimeSession[] = useMemo(
    () =>
      trainings
        .filter((tr) => tr.status !== TrainingSessionStatus.CANCELLED)
        .map((tr) => ({
          id: tr.id,
          startTime: tr.startTime,
          endTime: tr.endTime,
          pitchPortion: tr.pitchPortion,
        })),
    [trainings],
  );

  // Add games as full-pitch sessions for layout
  const homeGames = useMemo(
    () => games.filter((g) => g.venueType === VenueType.HOME && g.date === date),
    [games, date],
  );

  const allSessions: TimeSession[] = useMemo(
    () => [
      ...activeSessions,
      ...homeGames.map((g) => ({
        id: `game-${g.id}`,
        startTime: g.startTime,
        endTime: g.endTime,
        pitchPortion: 1,
      })),
    ],
    [activeSessions, homeGames],
  );

  // Layout algorithm
  const layoutMap = useMemo(() => {
    const layouts = layoutSessions(allSessions);
    const map = new Map<string, { rowStart: number; rowSpan: number }>();
    for (const l of layouts) {
      map.set(l.id, { rowStart: l.rowStart, rowSpan: l.rowSpan });
    }
    return map;
  }, [allSessions]);

  // Cancelled trainings get their own layout (shown faded, stacked at bottom area)
  const cancelledTrainings = useMemo(
    () => trainings.filter((tr) => tr.status === TrainingSessionStatus.CANCELLED),
    [trainings],
  );

  const cancelledLayoutMap = useMemo(() => {
    const sessions: TimeSession[] = cancelledTrainings.map((tr) => ({
      id: tr.id,
      startTime: tr.startTime,
      endTime: tr.endTime,
      pitchPortion: tr.pitchPortion,
    }));
    const layouts = layoutSessions(sessions);
    const map = new Map<string, { rowStart: number; rowSpan: number }>();
    for (const l of layouts) {
      map.set(l.id, { rowStart: l.rowStart, rowSpan: l.rowSpan });
    }
    return map;
  }, [cancelledTrainings]);

  // Overbooking detection
  const overbookingRanges = useMemo(
    () => findOverbookingRanges(allSessions),
    [allSessions],
  );

  // Current time line
  const now = dayjs();
  const isToday = now.format('YYYY-MM-DD') === date;
  const currentTimeLeft = isToday
    ? (now.hour() * 60 + now.minute() - startHour * 60) * pixelsPerMinute
    : -1;

  const hasEvents = trainings.length > 0 || homeGames.length > 0;

  return (
    <Box ref={containerRef} sx={{ width: '100%', overflowX: 'auto' }}>
      <TimeAxis
        startHour={startHour}
        endHour={endHour}
        pixelsPerMinute={pixelsPerMinute}
      />
      <PortionGrid
        startHour={startHour}
        endHour={endHour}
        pixelsPerMinute={pixelsPerMinute}
      >
        {/* Overbooking overlays */}
        <OverbookingIndicator
          ranges={overbookingRanges}
          startHour={startHour}
          pixelsPerMinute={pixelsPerMinute}
        />

        {/* Current time line */}
        {isToday && currentTimeLeft > 0 && currentTimeLeft < containerWidth && (
          <Box
            sx={{
              position: 'absolute',
              left: currentTimeLeft,
              top: 0,
              bottom: 0,
              width: 2,
              bgcolor: 'error.main',
              zIndex: 5,
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Active training blocks */}
        {trainings
          .filter((tr) => tr.status !== TrainingSessionStatus.CANCELLED)
          .map((tr) => {
            const layout = layoutMap.get(tr.id);
            if (!layout) return null;
            const blockLeft = timeToPixel(tr.startTime, startHour, pixelsPerMinute);
            const blockRight = timeToPixel(tr.endTime, startHour, pixelsPerMinute);
            const blockWidth = blockRight - blockLeft;
            return (
              <TimelineBlock
                key={tr.id}
                id={tr.id}
                type="training"
                label={tr.teamName}
                startTime={tr.startTime}
                endTime={tr.endTime}
                rowStart={layout.rowStart}
                rowSpan={layout.rowSpan}
                color={teamColorMap.get(tr.teamId) ?? '#1976d2'}
                left={blockLeft}
                width={blockWidth}
                isDraggable={canDrag}
                pixelsPerMinute={pixelsPerMinute}
                onDragEnd={onTrainingDragEnd}
                onClick={() => onBlockClick('training', tr.id)}
              />
            );
          })}

        {/* Cancelled training blocks */}
        {cancelledTrainings.map((tr) => {
          const layout = cancelledLayoutMap.get(tr.id);
          if (!layout) return null;
          const blockLeft = timeToPixel(tr.startTime, startHour, pixelsPerMinute);
          const blockRight = timeToPixel(tr.endTime, startHour, pixelsPerMinute);
          const blockWidth = blockRight - blockLeft;
          return (
            <TimelineBlock
              key={tr.id}
              id={tr.id}
              type="training"
              label={tr.teamName}
              startTime={tr.startTime}
              endTime={tr.endTime}
              rowStart={layout.rowStart}
              rowSpan={layout.rowSpan}
              color="#9e9e9e"
              left={blockLeft}
              width={blockWidth}
              isDraggable={false}
              pixelsPerMinute={pixelsPerMinute}
              onClick={() => onBlockClick('training', tr.id)}
              isCancelled
            />
          );
        })}

        {/* Game blocks */}
        {homeGames.map((g) => {
          const layout = layoutMap.get(`game-${g.id}`);
          if (!layout) return null;
          const blockLeft = timeToPixel(g.startTime, startHour, pixelsPerMinute);
          const blockRight = timeToPixel(g.endTime, startHour, pixelsPerMinute);
          const blockWidth = blockRight - blockLeft;
          return (
            <TimelineBlock
              key={`game-${g.id}`}
              id={g.id}
              type="game"
              label={`vs ${g.opponent}`}
              startTime={g.startTime}
              endTime={g.endTime}
              rowStart={layout.rowStart}
              rowSpan={layout.rowSpan}
              color={GAME_COLOR}
              left={blockLeft}
              width={blockWidth}
              isDraggable={false}
              pixelsPerMinute={pixelsPerMinute}
              onClick={() => onBlockClick('game', g.id)}
            />
          );
        })}
      </PortionGrid>

      {!hasEvents && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            {t('pitches.noSessionsToday')}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
