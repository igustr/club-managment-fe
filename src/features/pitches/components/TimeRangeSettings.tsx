import { useTranslation } from 'react-i18next';
import {
  Popover,
  Box,
  Typography,
  TextField,
  Button,
  Stack,
} from '@mui/material';
import { useUiStore } from '@/stores/uiStore';

interface TimeRangeSettingsProps {
  anchorEl: HTMLElement | null;
  onClose: () => void;
}

export function TimeRangeSettings({ anchorEl, onClose }: TimeRangeSettingsProps) {
  const { t } = useTranslation();
  const startHour = useUiStore((s) => s.scheduleStartHour);
  const endHour = useUiStore((s) => s.scheduleEndHour);
  const setStartHour = useUiStore((s) => s.setScheduleStartHour);
  const setEndHour = useUiStore((s) => s.setScheduleEndHour);

  return (
    <Popover
      open={!!anchorEl}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Box sx={{ p: 2, minWidth: 220 }}>
        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
          {t('pitches.timeRange')}
        </Typography>
        <Stack spacing={2}>
          <TextField
            label={t('pitches.startHour')}
            type="number"
            size="small"
            value={startHour}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val >= 0 && val < endHour) setStartHour(val);
            }}
            slotProps={{ htmlInput: { min: 0, max: 23 } }}
          />
          <TextField
            label={t('pitches.endHour')}
            type="number"
            size="small"
            value={endHour}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > startHour && val <= 24) setEndHour(val);
            }}
            slotProps={{ htmlInput: { min: 1, max: 24 } }}
          />
          <Button
            size="small"
            onClick={() => {
              setStartHour(8);
              setEndHour(22);
            }}
          >
            {t('pitches.resetTimeRange')}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
}
