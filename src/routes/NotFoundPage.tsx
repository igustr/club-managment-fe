import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';

export function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
      }}
    >
      <Typography variant="h1" fontWeight={700} color="text.secondary" sx={{ mb: 2 }}>
        404
      </Typography>
      <Typography variant="h6" gutterBottom>
        {t('error.pageNotFound')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('error.pageNotFoundDescription')}
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        {t('error.goHome')}
      </Button>
    </Box>
  );
}
