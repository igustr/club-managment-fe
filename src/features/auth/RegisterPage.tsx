import { useState, useMemo } from 'react';
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
  LinearProgress,
} from '@mui/material';
import { Visibility, VisibilityOff, Info } from '@mui/icons-material';
import { useRegister } from '@/api/auth.api';
import { registerSchema, type RegisterFormValues } from './schemas';
import { AuthLayout } from './components/AuthLayout';

function getPasswordStrength(password: string): {
  score: number;
  label: 'weak' | 'medium' | 'strong';
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 33, label: 'weak' };
  if (score <= 3) return { score: 66, label: 'medium' };
  return { score: 100, label: 'strong' };
}

const strengthColors = {
  weak: '#EF4444',
  medium: '#F59E0B',
  strong: '#22C55E',
};

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegister();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema(t)),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      dateOfBirth: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');
  const strength = useMemo(
    () => (password ? getPasswordStrength(password) : null),
    [password],
  );

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        dateOfBirth: values.dateOfBirth,
        phone: values.phone,
        password: values.password,
      });
      navigate('/login', { replace: true });
    } catch (err: unknown) {
      const error = err as { response?: { status?: number } };
      if (error.response?.status === 409) {
        setServerError(t('auth.register.emailInUse'));
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
            {t('auth.register.title')}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t('auth.register.description')}
          </Typography>

          {/* Info box */}
          <Alert
            severity="info"
            icon={<Info />}
            sx={{
              mb: 3,
              bgcolor: '#F0FDFA',
              border: '1px solid #CCFBF1',
              color: '#0F766E',
              '& .MuiAlert-icon': { color: '#0F766E' },
            }}
          >
            {t('auth.register.info')}
          </Alert>

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
            {/* First name + Last name */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
              <Controller
                name="firstName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.register.firstName')}
                    placeholder={t('auth.register.firstNamePlaceholder')}
                    error={!!errors.firstName}
                    helperText={errors.firstName?.message}
                    required
                    autoFocus
                  />
                )}
              />
              <Controller
                name="lastName"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.register.lastName')}
                    placeholder={t('auth.register.lastNamePlaceholder')}
                    error={!!errors.lastName}
                    helperText={errors.lastName?.message}
                    required
                  />
                )}
              />
            </Box>

            {/* Email */}
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.register.email')}
                  placeholder={t('auth.register.emailPlaceholder')}
                  type="email"
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  sx={{ mb: 2.5 }}
                  required
                  autoComplete="email"
                />
              )}
            />

            {/* Date of birth + Phone */}
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 2.5 }}>
              <Controller
                name="dateOfBirth"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.register.dateOfBirth')}
                    type="date"
                    error={!!errors.dateOfBirth}
                    helperText={errors.dateOfBirth?.message}
                    required
                    slotProps={{
                      inputLabel: { shrink: true },
                    }}
                  />
                )}
              />
              <Controller
                name="phone"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    fullWidth
                    label={t('auth.register.phone')}
                    placeholder={t('auth.register.phonePlaceholder')}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    required
                  />
                )}
              />
            </Box>

            {/* Password */}
            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.register.password')}
                  placeholder={t('auth.register.passwordPlaceholder')}
                  type={showPassword ? 'text' : 'password'}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  required
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            size="small"
                          >
                            {showPassword ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                />
              )}
            />

            {/* Password strength */}
            {strength && (
              <Box sx={{ mt: 1, mb: 2.5 }}>
                <LinearProgress
                  variant="determinate"
                  value={strength.score}
                  sx={{
                    height: 4,
                    borderRadius: 2,
                    bgcolor: '#E2E8F0',
                    '& .MuiLinearProgress-bar': {
                      bgcolor: strengthColors[strength.label],
                      borderRadius: 2,
                    },
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ color: strengthColors[strength.label], mt: 0.5 }}
                >
                  {t(`auth.register.passwordStrength.${strength.label}`)}
                </Typography>
              </Box>
            )}

            {!strength && <Box sx={{ mb: 2.5 }} />}

            {/* Confirm password */}
            <Controller
              name="confirmPassword"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  label={t('auth.register.confirmPassword')}
                  placeholder={t('auth.register.confirmPasswordPlaceholder')}
                  type={showConfirmPassword ? 'text' : 'password'}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  sx={{ mb: 3 }}
                  required
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            edge="end"
                            size="small"
                          >
                            {showConfirmPassword ? (
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
              disabled={registerMutation.isPending}
              sx={{ mb: 2 }}
            >
              {registerMutation.isPending
                ? t('common.loading')
                : t('auth.register.submit')}
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
              {t('auth.register.hasAccount')}{' '}
              <Link component={RouterLink} to="/login" fontWeight={600}>
                {t('auth.register.login')}
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
