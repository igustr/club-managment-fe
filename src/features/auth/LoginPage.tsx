import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  IconButton,
  InputAdornment,
  Link,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useLogin } from '@/api/auth.api';
import { getMe } from '@/api/auth.api';
import { useAuthStore } from '@/stores/authStore';
import { SystemRole } from '@/types/common.types';
import { loginSchema, type LoginFormValues } from './schemas';
import { AuthLayout } from './components/AuthLayout';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const login = useAuthStore((s) => s.login);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema(t)),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      const authResponse = await loginMutation.mutateAsync(values);
      // Temporarily set tokens to make getMe work
      useAuthStore.getState().setTokens(authResponse);
      const user = await getMe();
      login(authResponse, user);

      // Post-login routing
      if (user.systemRole === SystemRole.MASTER_ADMIN) {
        navigate('/admin/clubs', { replace: true });
      } else if (user.clubId) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/no-club', { replace: true });
      }
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 401) {
        setServerError(t('auth.login.error'));
      } else {
        setServerError(t('error.generic'));
      }
    }
  };

  return (
    <AuthLayout>
      <Card>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            {t('auth.login.title')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t('auth.login.description')}
          </Typography>

          {serverError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {serverError}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
          >
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.login.email')}
                  placeholder={t('auth.login.emailPlaceholder')}
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2.5 }}
                  autoComplete="email"
                  autoFocus
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.login.password')}
                  placeholder={t('auth.login.passwordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={{ mb: 3 }}
                  autoComplete="current-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? (
                              <VisibilityOff />
                            ) : (
                              <Visibility />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loginMutation.isPending}
              sx={{ mb: 2 }}
            >
              {loginMutation.isPending
                ? t('common.loading')
                : t('auth.login.submit')}
            </Button>
          </Box>

          <Box
            sx={{
              textAlign: 'center',
              mt: 3,
              pt: 2.5,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              {t('auth.login.noAccount')}{' '}
              <Link component={RouterLink} to="/register" fontWeight={600}>
                {t('auth.login.register')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
