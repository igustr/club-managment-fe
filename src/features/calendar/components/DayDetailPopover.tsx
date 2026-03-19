import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
  Divider,
} from '@mui/material';
import {
  FitnessCenter,
  SportsSoccer,
  EmojiEvents,
} from '@mui/icons-material';
import type { CalendarEvent } from './MonthlyCalendar';
import { formatTime } from '@/utils/date';
import dayjs from 'dayjs';

interface DayDetailPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  date: dayjs.Dayjs | null;
  events: CalendarEvent[];
}

const eventTypeIcon: Record<string, React.ReactNode> = {
  training: <FitnessCenter fontSize="small" color="action" />,
  game: <SportsSoccer fontSize="small" sx={{ color: '#C2410C' }} />,
  tournament: <EmojiEvents fontSize="small" sx={{ color: '#6D28D9' }} />,
};

export function DayDetailPopover({
  anchorEl,
  open,
  onClose,
  date,
  events,
}: DayDetailPopoverProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sorted = [...events].sort((a, b) =>
    (a.startTime ?? '').localeCompare(b.startTime ?? ''),
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      transformOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Box sx={{ minWidth: 280, maxWidth: 360, p: 2 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
          {date?.format('dddd, DD.MM.YYYY')}
        </Typography>
        {sorted.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            {t('calendar.noSessions')}
          </Typography>
        ) : (
          <List dense disablePadding>
            {sorted.map((event, i) => (
              <Box key={event.id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  onClick={() => {
                    onClose();
                    navigate(event.navigateTo);
                  }}
                  sx={{ borderRadius: 1 }}
                >
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    {eventTypeIcon[event.eventType]}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                        }}
                      >
                        <Typography variant="body2" fontWeight={500}>
                          {event.startTime
                            ? `${formatTime(event.startTime)} `
                            : ''}
                          {event.label}
                        </Typography>
                        {event.status === 'CANCELLED' && (
                          <Chip
                            label={t('games.cancelled')}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption">
                        {event.teamName}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </Box>
            ))}
          </List>
        )}
      </Box>
    </Popover>
  );
}
