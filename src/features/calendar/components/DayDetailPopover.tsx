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
  Button,
  Stack,
} from '@mui/material';
import {
  FitnessCenter,
  SportsSoccer,
  EmojiEvents,
} from '@mui/icons-material';
import type { CalendarEvent } from './MonthlyCalendar';
import { formatTime } from '@/utils/date';
import { dayjs } from '@/utils/date';

interface DayDetailPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  date: dayjs.Dayjs | null;
  events: CalendarEvent[];
  canCreate?: boolean;
  onCreateTraining?: (date: string) => void;
  onCreateGame?: (date: string) => void;
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
  canCreate,
  onCreateTraining,
  onCreateGame,
}: DayDetailPopoverProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sorted = [...events].sort((a, b) =>
    (a.startTime ?? '').localeCompare(b.startTime ?? ''),
  );

  const dateStr = date?.format('YYYY-MM-DD') ?? '';

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
          <Typography variant="body2" color="text.secondary" sx={{ mb: canCreate ? 1.5 : 0 }}>
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
        {canCreate && (
          <>
            <Divider sx={{ my: 1 }} />
            <Stack direction="row" spacing={1}>
              <Button
                size="small"
                startIcon={<FitnessCenter fontSize="small" />}
                onClick={() => {
                  onClose();
                  onCreateTraining?.(dateStr);
                }}
              >
                {t('trainings.createTraining')}
              </Button>
              <Button
                size="small"
                startIcon={<SportsSoccer fontSize="small" />}
                onClick={() => {
                  onClose();
                  onCreateGame?.(dateStr);
                }}
              >
                {t('games.createGame')}
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </Popover>
  );
}
