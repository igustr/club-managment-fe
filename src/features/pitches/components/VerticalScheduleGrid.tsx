import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Tooltip, Chip } from '@mui/material';
import { Warning, Stadium, FitnessCenter, SportsSoccer } from '@mui/icons-material';
import { timeToMinutes } from '../utils/timeline';
import { formatTime } from '@/utils/date';
import type {
  PitchScheduleEntryDTO,
  PitchScheduleEventDTO,
} from '@/types/pitch.types';
import dayjs from 'dayjs';

const TIME_COL_WIDTH = 64;
const HEADER_HEIGHT = 56;
const SLOT_MIN = 30;
const SLOT_HEIGHT = 24;
const LANES_PER_PITCH = 8;
const LANE_WIDTH = 26;
const PITCH_COL_WIDTH = LANES_PER_PITCH * LANE_WIDTH;

const TEAM_COLORS = [
  { bg: '#E3F2FD', border: '#1976D2', text: '#0D47A1' },
  { bg: '#E8F5E9', border: '#388E3C', text: '#1B5E20' },
  { bg: '#F3E5F5', border: '#7B1FA2', text: '#4A148C' },
  { bg: '#FFEBEE', border: '#C62828', text: '#B71C1C' },
  { bg: '#E0F7FA', border: '#00838F', text: '#006064' },
  { bg: '#FFF3E0', border: '#E65100', text: '#BF360C' },
  { bg: '#EDE7F6', border: '#4527A0', text: '#311B92' },
  { bg: '#F1F8E9', border: '#558B2F', text: '#33691E' },
];
const GAME_COLOR = { bg: '#FFF8E1', border: '#F59E0B', text: '#B26F00' };

interface VerticalScheduleGridProps {
  pitches: PitchScheduleEntryDTO[];
  date: string;
  startHour: number;
  endHour: number;
  conflictEventIds: Set<string>;
  onEventClick: (event: PitchScheduleEventDTO) => void;
}

interface LanePosition {
  laneStart: number;
  laneSpan: number;
}

function portionToLanes(portion: number): number {
  return Math.max(1, Math.min(LANES_PER_PITCH, Math.round(portion * LANES_PER_PITCH)));
}

function assignLanes(events: PitchScheduleEventDTO[]): Map<string, LanePosition> {
  const sorted = [...events].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );
  const laneFreeAt = new Array(LANES_PER_PITCH).fill(0);
  const result = new Map<string, LanePosition>();

  for (const event of sorted) {
    const start = timeToMinutes(event.startTime);
    const end = timeToMinutes(event.endTime);
    const span = portionToLanes(event.pitchPortion ?? 1);

    let laneStart = -1;
    for (let i = 0; i <= LANES_PER_PITCH - span; i++) {
      let free = true;
      for (let j = i; j < i + span; j++) {
        if (laneFreeAt[j] > start) {
          free = false;
          break;
        }
      }
      if (free) {
        laneStart = i;
        break;
      }
    }
    if (laneStart === -1) laneStart = 0;

    for (let j = laneStart; j < Math.min(laneStart + span, LANES_PER_PITCH); j++) {
      laneFreeAt[j] = end;
    }

    result.set(event.id, { laneStart, laneSpan: span });
  }
  return result;
}

export function VerticalScheduleGrid({
  pitches,
  date,
  startHour,
  endHour,
  conflictEventIds,
  onEventClick,
}: VerticalScheduleGridProps) {
  const { t } = useTranslation();

  const teamColorMap = useMemo(() => {
    const map = new Map<string, (typeof TEAM_COLORS)[number]>();
    const uniqueTeamIds = new Set<string>();
    for (const p of pitches) {
      for (const ev of p.events) {
        if (ev.eventType === 'TRAINING') uniqueTeamIds.add(ev.teamId);
      }
    }
    [...uniqueTeamIds].forEach((id, i) => {
      map.set(id, TEAM_COLORS[i % TEAM_COLORS.length]!);
    });
    return map;
  }, [pitches]);

  const dayEventsByPitch = useMemo(() => {
    const result = new Map<
      string,
      { events: PitchScheduleEventDTO[]; lanes: Map<string, LanePosition> }
    >();
    for (const p of pitches) {
      const dayFiltered = p.events.filter((e) => e.date === date);
      result.set(p.pitchId, {
        events: dayFiltered,
        lanes: assignLanes(dayFiltered),
      });
    }
    return result;
  }, [pitches, date]);

  const totalSlots = ((endHour - startHour) * 60) / SLOT_MIN;
  const gridHeight = totalSlots * SLOT_HEIGHT;
  const timeSlots = Array.from({ length: totalSlots }, (_, i) => {
    const totalMinutes = startHour * 60 + i * SLOT_MIN;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    return {
      i,
      hour,
      minute,
      top: i * SLOT_HEIGHT,
      label: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    };
  });

  const isToday = dayjs(date).isSame(dayjs(), 'day');
  const now = dayjs();
  const currentTimeOffset = isToday
    ? ((now.hour() * 60 + now.minute() - startHour * 60) / SLOT_MIN) *
      SLOT_HEIGHT
    : -1;

  if (pitches.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Stadium sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
        <Typography color="text.secondary">{t('pitches.noPitches')}</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        overflow: 'auto',
        maxHeight: 'calc(100vh - 320px)',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        position: 'relative',
      }}
    >
      <Box sx={{ display: 'flex', minWidth: 'fit-content' }}>
        {/* Time column (sticky left) */}
        <Box
          sx={{
            position: 'sticky',
            left: 0,
            zIndex: 3,
            width: TIME_COL_WIDTH,
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderRight: '2px solid',
            borderColor: 'divider',
          }}
        >
          {/* Top-left corner */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 4,
              height: HEADER_HEIGHT,
              bgcolor: 'background.paper',
              borderBottom: '2px solid',
              borderColor: 'divider',
            }}
          />
          <Box sx={{ position: 'relative', height: gridHeight }}>
            {timeSlots.map((slot) => (
              <Box
                key={`time-${slot.i}`}
                sx={{
                  position: 'absolute',
                  top: slot.top,
                  left: 0,
                  right: 0,
                  height: SLOT_HEIGHT,
                  borderBottom:
                    slot.minute === 0 ? '1px solid' : '1px dashed',
                  borderColor:
                    slot.minute === 0 ? 'divider' : 'action.hover',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-end',
                  pr: 1,
                  pt: 0.25,
                }}
              >
                {slot.minute === 0 && (
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    color="text.secondary"
                    sx={{ fontSize: 11, lineHeight: 1 }}
                  >
                    {slot.label}
                  </Typography>
                )}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Pitch columns */}
        {pitches.map((pitch) => {
          const dayData = dayEventsByPitch.get(pitch.pitchId);
          const events = dayData?.events ?? [];
          const lanes = dayData?.lanes ?? new Map<string, LanePosition>();

          return (
            <Box
              key={pitch.pitchId}
              sx={{
                width: PITCH_COL_WIDTH,
                flexShrink: 0,
                borderRight: '1px solid',
                borderColor: 'divider',
              }}
            >
              {/* Header (sticky top) */}
              <Box
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 2,
                  height: HEADER_HEIGHT,
                  bgcolor: 'primary.50',
                  borderBottom: '2px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  px: 1,
                }}
              >
                <Stadium
                  sx={{ fontSize: 14, color: 'primary.main', mb: 0.25 }}
                />
                <Typography
                  variant="subtitle2"
                  fontWeight={700}
                  color="primary.main"
                  noWrap
                  sx={{ width: '100%', textAlign: 'center', fontSize: 12 }}
                >
                  {pitch.pitchName}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: 10 }}
                >
                  {events.length}{' '}
                  {t('pitches.scheduleView.eventsShort')}
                </Typography>
              </Box>

              {/* Body — grid lines + events */}
              <Box sx={{ position: 'relative', height: gridHeight }}>
                {/* Hour/half-hour grid lines */}
                {timeSlots.map((slot) => (
                  <Box
                    key={`gline-${slot.i}`}
                    sx={{
                      position: 'absolute',
                      top: slot.top,
                      left: 0,
                      right: 0,
                      height: SLOT_HEIGHT,
                      borderBottom:
                        slot.minute === 0 ? '1px solid' : '1px dashed',
                      borderColor:
                        slot.minute === 0 ? 'divider' : 'action.hover',
                      bgcolor:
                        slot.hour % 2 === 0 ? 'transparent' : 'grey.50',
                    }}
                  />
                ))}

                {/* Mid-pitch divider (between lanes 4 and 5) */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: PITCH_COL_WIDTH / 2,
                    width: 1,
                    bgcolor: 'action.hover',
                    pointerEvents: 'none',
                  }}
                />

                {/* Events */}
                {events.map((event) => {
                  const startMin = timeToMinutes(event.startTime);
                  const endMin = timeToMinutes(event.endTime);
                  const top =
                    ((startMin - startHour * 60) / SLOT_MIN) * SLOT_HEIGHT;
                  const blockHeight = Math.max(
                    ((endMin - startMin) / SLOT_MIN) * SLOT_HEIGHT - 2,
                    SLOT_HEIGHT - 2,
                  );
                  const lane = lanes.get(event.id);
                  const laneStart = lane?.laneStart ?? 0;
                  const laneSpan = lane?.laneSpan ?? LANES_PER_PITCH;
                  const left = laneStart * LANE_WIDTH;
                  const width = Math.max(laneSpan * LANE_WIDTH - 2, 20);

                  const colors =
                    event.eventType === 'GAME'
                      ? GAME_COLOR
                      : (teamColorMap.get(event.teamId) ?? TEAM_COLORS[0]!);
                  const isConflict = conflictEventIds.has(event.id);
                  const portionPct = Math.round(
                    (event.pitchPortion ?? 1) * 100,
                  );
                  const tooltipText = `${event.teamName} · ${formatTime(event.startTime)}–${formatTime(event.endTime)} · ${portionPct}%${isConflict ? ` · ${t('pitches.scheduleView.conflictMark')}` : ''}`;

                  return (
                    <Tooltip
                      key={event.id}
                      title={tooltipText}
                      placement="top"
                      arrow
                    >
                      <Box
                        onClick={() => onEventClick(event)}
                        sx={{
                          position: 'absolute',
                          top: top + 1,
                          left: left + 1,
                          width,
                          height: blockHeight,
                          bgcolor: colors.bg,
                          border: isConflict ? '2px solid' : '1px solid',
                          borderColor: isConflict
                            ? 'error.main'
                            : colors.border,
                          borderLeft: `4px solid ${isConflict ? '#d32f2f' : colors.border}`,
                          borderRadius: 0.5,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start',
                          alignItems: 'flex-start',
                          px: 0.5,
                          py: 0.25,
                          color: colors.text,
                          userSelect: 'none',
                          boxShadow: isConflict
                            ? '0 0 0 2px rgba(211,47,47,0.18)'
                            : 'none',
                          '&:hover': {
                            filter: 'brightness(0.95)',
                            boxShadow: 1,
                          },
                        }}
                      >
                        {isConflict && (
                          <Warning
                            sx={{
                              position: 'absolute',
                              top: 1,
                              right: 1,
                              fontSize: 12,
                              color: 'error.main',
                            }}
                          />
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.25,
                            width: '100%',
                          }}
                        >
                          {event.eventType === 'GAME' ? (
                            <SportsSoccer
                              sx={{ fontSize: 10, flexShrink: 0 }}
                            />
                          ) : (
                            <FitnessCenter
                              sx={{ fontSize: 10, flexShrink: 0 }}
                            />
                          )}
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              fontSize: 11,
                              lineHeight: 1.2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flex: 1,
                            }}
                          >
                            {event.teamName}
                          </Typography>
                        </Box>
                        {blockHeight > SLOT_HEIGHT && (
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: 9.5,
                              opacity: 0.85,
                              lineHeight: 1.1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {formatTime(event.startTime)}–
                            {formatTime(event.endTime)}
                          </Typography>
                        )}
                        {blockHeight > SLOT_HEIGHT * 1.8 &&
                          event.eventType === 'GAME' && (
                            <Chip
                              size="small"
                              label={t('calendar.games')}
                              sx={{
                                height: 14,
                                fontSize: 9,
                                bgcolor: colors.border,
                                color: 'common.white',
                                mt: 0.25,
                              }}
                            />
                          )}
                      </Box>
                    </Tooltip>
                  );
                })}

                {/* Current-time line (only on today) */}
                {isToday &&
                  currentTimeOffset > 0 &&
                  currentTimeOffset < gridHeight && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: currentTimeOffset,
                        left: 0,
                        right: 0,
                        height: 2,
                        bgcolor: 'error.main',
                        zIndex: 5,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
