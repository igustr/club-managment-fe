import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Avatar,
  CircularProgress,
  Button,
  Divider,
} from '@mui/material';
import {
  Person,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  FitnessCenter,
  TrendingUp,
  CalendarMonth,
  ArrowForward,
} from '@mui/icons-material';
import { useChildren } from '@/api/user.api';
import { usePlayerStatistics } from '@/api/statistics.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import type { UserDTO } from '@/types/auth.types';

function AttendanceRing({
  value,
  size = 100,
  thickness = 8,
}: {
  value: number;
  size?: number;
  thickness?: number;
}) {
  const color =
    value >= 75 ? 'success.main' : value >= 50 ? 'warning.main' : 'error.main';

  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress
        variant="determinate"
        value={100}
        size={size}
        thickness={thickness}
        sx={{ color: 'action.hover' }}
      />
      <CircularProgress
        variant="determinate"
        value={value}
        size={size}
        thickness={thickness}
        sx={{ color, position: 'absolute', left: 0 }}
      />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h5" fontWeight={800} color={color}>
          {Math.round(value)}%
        </Typography>
      </Box>
    </Box>
  );
}

function StatBox({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        flex: 1,
        minWidth: 100,
        textAlign: 'center',
        borderColor: `${color}30`,
        bgcolor: `${color}08`,
      }}
    >
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h5" fontWeight={700} color={color}>
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

function ChildCard({ child, clubId }: { child: UserDTO; clubId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = usePlayerStatistics(clubId, child.id);

  const hasStats = stats && stats.totalTrainings > 0;

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2.5,
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        },
      }}
    >
      {/* Child header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer',
        }}
        onClick={() => navigate(`/members/${child.id}`)}
      >
        <Avatar
          sx={{
            width: 56,
            height: 56,
            bgcolor: 'primary.main',
            fontWeight: 600,
            fontSize: 18,
          }}
        >
          {child.firstName.charAt(0)}
          {child.lastName.charAt(0)}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {child.firstName} {child.lastName}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            {child.position && (
              <Chip
                label={t(`positions.${child.position}`)}
                size="small"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
          </Stack>
        </Box>
        <ArrowForward color="action" />
      </Box>

      {hasStats ? (
        <>
          <Divider />
          <Box sx={{ p: 2.5 }}>
            {/* Main stat: Attendance ring + details */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems={{ xs: 'center', sm: 'flex-start' }}
            >
              {/* Attendance ring */}
              <Box sx={{ textAlign: 'center' }}>
                <AttendanceRing value={stats.attendanceRate} />
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mt: 1, display: 'block' }}
                >
                  {t('children.attendanceRate')}
                </Typography>
              </Box>

              {/* Detail stats grid */}
              <Box sx={{ flex: 1, width: '100%' }}>
                <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                  <StatBox
                    icon={<FitnessCenter sx={{ fontSize: 20 }} />}
                    label={t('children.totalTrainings')}
                    value={stats.totalTrainings}
                    color="#1976d2"
                  />
                  <StatBox
                    icon={<CheckCircle sx={{ fontSize: 20 }} />}
                    label={t('children.attended')}
                    value={stats.confirmedCount}
                    color="#2e7d32"
                  />
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <StatBox
                    icon={<Cancel sx={{ fontSize: 20 }} />}
                    label={t('children.declined')}
                    value={stats.declinedCount}
                    color="#d32f2f"
                  />
                  <StatBox
                    icon={<HourglassEmpty sx={{ fontSize: 20 }} />}
                    label={t('children.pending')}
                    value={stats.pendingCount}
                    color="#ed6c02"
                  />
                </Stack>

                {/* Attendance breakdown bar */}
                <Box sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      overflow: 'hidden',
                      bgcolor: 'action.hover',
                    }}
                  >
                    {stats.confirmedCount > 0 && (
                      <Box
                        sx={{
                          width: `${(stats.confirmedCount / stats.totalTrainings) * 100}%`,
                          bgcolor: 'success.main',
                        }}
                      />
                    )}
                    {stats.declinedCount > 0 && (
                      <Box
                        sx={{
                          width: `${(stats.declinedCount / stats.totalTrainings) * 100}%`,
                          bgcolor: 'error.main',
                        }}
                      />
                    )}
                    {stats.pendingCount > 0 && (
                      <Box
                        sx={{
                          width: `${(stats.pendingCount / stats.totalTrainings) * 100}%`,
                          bgcolor: 'warning.main',
                        }}
                      />
                    )}
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={2}
                    sx={{ mt: 0.5 }}
                    justifyContent="center"
                  >
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t('children.attended')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'error.main',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t('children.declined')}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                        }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {t('children.pending')}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              </Box>
            </Stack>
          </Box>

          {/* Actions footer */}
          <Divider />
          <Stack direction="row" spacing={1} sx={{ p: 1.5 }}>
            <Button
              size="small"
              startIcon={<TrendingUp />}
              onClick={() => navigate(`/members/${child.id}`)}
            >
              {t('children.viewDetails')}
            </Button>
            <Button
              size="small"
              startIcon={<CalendarMonth />}
              onClick={() => navigate('/calendar')}
            >
              {t('nav.calendar')}
            </Button>
          </Stack>
        </>
      ) : (
        <>
          <Divider />
          <Box sx={{ p: 2.5, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              {t('statistics.noData')}
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}

export function ChildrenPage() {
  const { t } = useTranslation();
  const clubId = useClubId();
  const user = useAuthStore((s) => s.user);
  const { data: children, isLoading } = useChildren(clubId, user?.id);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 0.5 }}>
        {t('nav.children')}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {t('children.subtitle')}
      </Typography>

      {(!children || children.length === 0) && (
        <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
          <Person sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
          <Typography color="text.secondary">
            {t('dashboard.noChildren')}
          </Typography>
        </Paper>
      )}

      {children?.map((child) => (
        <ChildCard key={child.id} child={child} clubId={clubId!} />
      ))}
    </Box>
  );
}
