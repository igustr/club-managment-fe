import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Paper, Chip } from '@mui/material';
import type { TrainingSessionDTO } from '@/types/training.types';
import { TrainingSessionStatus } from '@/types/common.types';
import { DayDetailPopover } from './DayDetailPopover';
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

interface MonthlyCalendarProps {
  month: dayjs.Dayjs;
  sessions: TrainingSessionDTO[];
}

export function MonthlyCalendar({ month, sessions }: MonthlyCalendarProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [popoverAnchor, setPopoverAnchor] = useState<HTMLElement | null>(null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  // Build team color map
  const teamColorMap = useMemo(() => {
    const uniqueTeams = [...new Set(sessions.map((s) => s.teamId))];
    const map = new Map<string, string>();
    uniqueTeams.forEach((teamId, i) => {
      map.set(teamId, TEAM_COLORS[i % TEAM_COLORS.length] ?? '#0D9488');
    });
    return map;
  }, [sessions]);

  // Build session map by date
  const sessionsByDate = useMemo(() => {
    const map = new Map<string, TrainingSessionDTO[]>();
    sessions.forEach((s) => {
      const key = s.date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    });
    return map;
  }, [sessions]);

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

  const selectedSessions = selectedDate
    ? sessionsByDate.get(selectedDate.format('YYYY-MM-DD')) ?? []
    : [];

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
              const daySessions = sessionsByDate.get(dayStr) ?? [];
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
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, mt: 0.25 }}>
                    {daySessions
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .slice(0, 3)
                      .map((session) => (
                        <Chip
                          key={session.id}
                          label={`${formatTime(session.startTime)} ${session.teamName}`}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/trainings/${session.id}`);
                          }}
                          sx={{
                            height: 18,
                            fontSize: '0.65rem',
                            bgcolor:
                              session.status === TrainingSessionStatus.CANCELLED
                                ? 'error.100'
                                : teamColorMap.get(session.teamId) + '1A',
                            color:
                              session.status === TrainingSessionStatus.CANCELLED
                                ? 'error.main'
                                : teamColorMap.get(session.teamId),
                            fontWeight: 500,
                            textDecoration:
                              session.status === TrainingSessionStatus.CANCELLED
                                ? 'line-through'
                                : 'none',
                            '& .MuiChip-label': { px: 0.5 },
                          }}
                        />
                      ))}
                    {daySessions.length > 3 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ pl: 0.5, fontSize: '0.6rem' }}
                      >
                        +{daySessions.length - 3} {t('calendar.more')}
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
        sessions={selectedSessions}
      />
    </>
  );
}
