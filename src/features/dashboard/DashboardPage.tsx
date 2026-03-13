import { useTranslation } from 'react-i18next';
import { Typography, Box } from '@mui/material';

export function DashboardPage() {
  const { t } = useTranslation();

  return (
    <Box>
      <Typography variant="h5" fontWeight={700}>
        {t('nav.dashboard')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Dashboard content will be implemented in Phase 3.
      </Typography>
    </Box>
  );
}
