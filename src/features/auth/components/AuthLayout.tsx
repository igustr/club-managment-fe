import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Typography, Button } from '@mui/material';
import { useUiStore } from '@/stores/uiStore';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  const { t, i18n } = useTranslation();
  const setLanguage = useUiStore((s) => s.setLanguage);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'et' ? 'en' : 'et';
    i18n.changeLanguage(newLang);
    setLanguage(newLang);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 3,
        position: 'relative',
      }}
    >
      {/* Language switcher */}
      <Button
        onClick={toggleLanguage}
        variant="outlined"
        size="small"
        sx={{
          position: 'absolute',
          top: 20,
          right: 24,
          borderColor: 'divider',
          color: 'text.secondary',
          fontWeight: 500,
          fontSize: 13,
          '&:hover': {
            borderColor: 'primary.main',
            color: 'primary.main',
          },
        }}
      >
        {i18n.language === 'et' ? 'EN' : 'ET'}
      </Button>

      <Box sx={{ width: '100%', maxWidth: 420 }}>
        {/* Brand */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'primary.main',
              borderRadius: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
            }}
          >
            <SportsSoccerIcon sx={{ fontSize: 28, color: 'white' }} />
          </Box>
          <Typography variant="h5" fontWeight={700} color="text.primary">
            {t('common.appName')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('common.appSubtitle')}
          </Typography>
        </Box>

        {children}
      </Box>
    </Box>
  );
}
