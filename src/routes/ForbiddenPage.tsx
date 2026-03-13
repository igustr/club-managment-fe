import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Block } from '@mui/icons-material';

export function ForbiddenPage() {
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
      <Block sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
      <Typography variant="h5" fontWeight={700} gutterBottom>
        {t('error.forbidden403')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('error.forbiddenDescription')}
      </Typography>
      <Button variant="contained" onClick={() => navigate(-1)}>
        {t('common.back')}
      </Button>
    </Box>
  );
}
