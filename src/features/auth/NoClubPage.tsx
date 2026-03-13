import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
} from '@mui/material';
import { HourglassEmpty, Logout } from '@mui/icons-material';
import { useAuthStore } from '@/stores/authStore';
import { getMe } from '@/api/auth.api';
import { useState } from 'react';
import { AuthLayout } from './components/AuthLayout';

export function NoClubPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const setUser = useAuthStore((s) => s.setUser);
  const [checking, setChecking] = useState(false);

  const handleCheckAgain = async () => {
    setChecking(true);
    try {
      const user = await getMe();
      setUser(user);
      if (user.clubId) {
        navigate('/dashboard', { replace: true });
      }
    } catch {
      // ignore
    } finally {
      setChecking(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <AuthLayout>
      <Card>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              bgcolor: '#F0FDFA',
              borderRadius: '50%',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 3,
            }}
          >
            <HourglassEmpty sx={{ fontSize: 32, color: 'primary.main' }} />
          </Box>

          <Typography variant="h6" fontWeight={700} gutterBottom>
            {t('auth.noClub.title')}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 320, mx: 'auto' }}
          >
            {t('auth.noClub.description')}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, fontStyle: 'italic' }}
          >
            {t('auth.noClub.waiting')}
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Button
              variant="contained"
              onClick={handleCheckAgain}
              disabled={checking}
              startIcon={
                checking ? <CircularProgress size={16} /> : undefined
              }
            >
              {t('auth.noClub.checkAgain')}
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleLogout}
              startIcon={<Logout />}
            >
              {t('auth.noClub.logout')}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
