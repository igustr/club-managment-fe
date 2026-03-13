import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Chip,
  Divider,
} from '@mui/material';
import type { TrainingSessionDTO } from '@/types/training.types';
import { TrainingSessionStatus } from '@/types/common.types';
import { formatTime } from '@/utils/date';
import dayjs from 'dayjs';

interface DayDetailPopoverProps {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  date: dayjs.Dayjs | null;
  sessions: TrainingSessionDTO[];
}

export function DayDetailPopover({
  anchorEl,
  open,
  onClose,
  date,
  sessions,
}: DayDetailPopoverProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const sorted = [...sessions].sort((a, b) =>
    a.startTime.localeCompare(b.startTime),
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
            {sorted.map((session, i) => (
              <Box key={session.id}>
                {i > 0 && <Divider />}
                <ListItemButton
                  onClick={() => {
                    onClose();
                    navigate(`/trainings/${session.id}`);
                  }}
                  sx={{ borderRadius: 1 }}
                >
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
                          {formatTime(session.startTime)} –{' '}
                          {formatTime(session.endTime)}
                        </Typography>
                        {session.status ===
                          TrainingSessionStatus.CANCELLED && (
                          <Chip
                            label={t('trainings.statusCancelled')}
                            size="small"
                            color="error"
                            variant="outlined"
                            sx={{ height: 20 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="caption">
                          {session.teamName}
                        </Typography>
                        {session.pitchName && (
                          <Typography variant="caption" color="text.disabled">
                            {' '}
                            — {session.pitchName}
                          </Typography>
                        )}
                      </Box>
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
