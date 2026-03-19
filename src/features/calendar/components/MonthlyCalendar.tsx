import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { DayDetailPopover } from './DayDetailPopover';
import { eventTypeColors } from '@/theme';
import { formatTime } from '@/utils/date';
import dayjs from 'dayjs';

// Stable team color palette
const TEAM_COLORS = [
  '#0D9488',
  '#4F46E5',
  '#DC2626',
  '#D97706',
  '#059669',
  '#7C3AED',
  '#DB2777',
  '#2563EB',
];

export interface CalendarEvent {
  id: string;
  originalId?: string;
  date: string;
  startTime: string | null;
  label: string;
  teamId: string;
  teamName: string;
  eventType: 'training' | 'game' | 'tournament';
  status: string;
  navigateTo: string;
}

interface MonthlyCalendarProps {
  month: dayjs.Dayjs;
  events: CalendarEvent[];
}

export function MonthlyCalendar({ month, events }: MonthlyCalendarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Build team color map
  const teamColorMap = useMemo(() => {
    const uniqueTeams = [...new Set(events.map((e) => e.teamId))];
    const map = new Map<string, string>();
    uniqueTeams.forEach((teamId, i) => {
      map.set(teamId, TEAM_COLORS[i % TEAM_COLORS.length] ?? '#0D9488');
    });
    return map;
  }, [events]);

  // Build event map by date
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    events.forEach((e) => {
      const key = e.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(e);
    });
    return map;
  }, [events]);

  // Calendar grid: 6 rows x 7 cols
  const startOfMonth = month.startOf('month');
  const startOfGrid = startOfMonth.startOf('week');
  const weeks: dayjs.Dayjs[][] = [];
  let current = startOfGrid;
  for (let w = 0; w < 6; w++) {
    const week: dayjs.Dayjs[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(current);
      current = current.add(1, 'day');
    }
    weeks.push(week);
  }

  // Day of week headers
  const dayHeaders = Array.from({ length: 7 }, (_, i) =>
    dayjs().startOf('week').add(i, 'day').format('dd'),
  );

  const today = dayjs();

  const handleDayClick = (
    event: React.MouseEvent<HTMLElement>,
    day: dayjs.Dayjs,
  ) => {
    setPopoverAnchor(event.currentTarget);
    setSelectedDate(day);
  };

  const selectedEvents = selectedDate
    ? eventsByDate.get(selectedDate.format('YYYY-MM-DD')) ?? []
    : [];

  const isCancelled = (status: string) =>
    status === 'CANCELLED';

  const getChipStyles = (event: CalendarEvent) => {
    const teamColor = teamColorMap.get(event.teamId) ?? '#0D9488';
    const cancelled = isCancelled(event.status);

    if (cancelled) {
      return {
        bgcolor: 'error.100',
        color: 'error.main',
        textDecoration: 'line-through',
        borderLeft: 'none',
      };
    }

    switch (event.eventType) {
      case 'game':
        return {
          bgcolor: eventTypeColors.game.bg,
          color: eventTypeColors.game.text,
          borderLeft: `3px solid ${teamColor}`,
        };
      case 'tournament':
        return {
          bgcolor: eventTypeColors.tournament.bg,
          color: eventTypeColors.tournament.text,
          borderLeft: `3px solid ${teamColor}`,
        };
      default:
        return {
          bgcolor: teamColor + '1A',
          color: teamColor,
          borderLeft: 'none',
        };
    }
  };

  return (
    <>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        {/* Header row */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {dayHeaders.map((d, i) => (
            <Box key={i} sx={{ py: 1, textAlign: 'center' }}>
              <Typography
                variant="caption"
                fontWeight={600}
                color="text.secondary"
                textTransform="uppercase"
              >
                {d}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Calendar grid */}
        {weeks.map((week, wi) => (
          <Box
            key={wi}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(7, 1fr)',
              borderBottom: wi < 5 ? 1 : 0,
              borderColor: 'divider',
            }}
          >
            {week.map((day) => {
              const dayStr = day.format('YYYY-MM-DD');
              const dayEvents = eventsByDate.get(dayStr) ?? [];
              const isCurrentMonth = day.month() === month.month();
              const isToday = day.isSame(today, 'day');

              return (
                <Box
                  key={dayStr}
                  onClick={(e) => handleDayClick(e, day)}
                  sx={{
                    minHeight: 90,
                    p: 0.5,
                    borderRight: 1,
                    borderColor: 'divider',
                    cursor: 'pointer',
                    bgcolor: isToday
                      ? 'primary.50'
                      : !isCurrentMonth
                        ? 'grey.50'
                        : undefined,
                    '&:hover': { bgcolor: 'action.hover' },
                    '&:last-child': { borderRight: 0 },
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={isToday ? 700 : 400}
                    color={
                      isToday
                        ? 'primary.main'
                        : !isCurrentMonth
                          ? 'text.disabled'
                          : 'text.primary'
                    }
                    sx={{
                      display: 'inline-block',
                      px: 0.5,
                      borderRadius: '50%',
                      ...(isToday && {
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 22,
                        height: 22,
                        lineHeight: '22px',
                        textAlign: 'center',
                      }),
                    }}
                  >
                    {day.date()}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.25,
                      mt: 0.25,
                    }}
                  >
                    {dayEvents
                      .sort((a, b) =>
                        (a.startTime ?? '').localeCompare(
                          b.startTime ?? '',
                        ),
                      )
                      .slice(0, 3)
                      .map((event) => {
                        const styles = getChipStyles(event);
                        const timeStr = event.startTime
                          ? `${formatTime(event.startTime)} `
                          : '';

                        return (
                          <Chip
                            key={event.id}
                            label={`${timeStr}${event.label}`}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(event.navigateTo);
                            }}
                            sx={{
                              height: 18,
                              fontSize: '0.65rem',
                              fontWeight: 500,
                              textDecoration:
                                styles.textDecoration ?? 'none',
                              bgcolor: styles.bgcolor,
                              color: styles.color,
                              borderLeft: styles.borderLeft,
                              borderRadius: styles.borderLeft
                                ? '2px'
                                : undefined,
                              '& .MuiChip-label': { px: 0.5 },
                            }}
                          />
                        );
                      })}
                    {dayEvents.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ pl: 0.5, fontSize: '0.6rem' }}
                      >
                        +{dayEvents.length - 3} {t('calendar.more')}
                      </Typography>
                    )}
                  </Box>
                </Box>
              );
            })}
          </Box>
        ))}
      </Paper>

      <DayDetailPopover
        anchorEl={popoverAnchor}
        open={!!popoverAnchor}
        onClose={() => {
          setPopoverAnchor(null);
          setSelectedDate(null);
        }}
        date={selectedDate}
        events={selectedEvents}
      />
    </>
  );
}
