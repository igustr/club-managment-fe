import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Paper,
  Stack,
  Chip,
  Avatar,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import { Person } from '@mui/icons-material';
import { useChildren } from '@/api/user.api';
import { usePlayerStatistics } from '@/api/statistics.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import type { UserDTO } from '@/types/auth.types';

function ChildCard({ child, clubId }: { child: UserDTO; clubId: string }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: stats } = usePlayerStatistics(clubId, child.id);

  const rateColor = (rate: number) =>
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  const rateBarColor = (rate: number): 'success' | 'warning' | 'error' =>
    rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'error';

  return (
    <Paper
      variant="outlined"
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': { borderColor: 'primary.main', bgcolor: 'action.hover' },
      }}
      onClick={() => navigate(`/members/${child.id}`)}
    >
      <Box sx={{ p: 2.5 }}>
        {/* Child header */}
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar
            sx={{
              width: 48,
              height: 48,
              bgcolor: 'primary.main',
              fontWeight: 600,
            }}
          >
            {child.firstName.charAt(0)}
            {child.lastName.charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" fontWeight={700}>
              {child.firstName} {child.lastName}
            </Typography>
            {child.position && (
              <Chip
                label={t(`positions.${child.position}`)}
                size="small"
                variant="outlined"
                sx={{ height: 22 }}
              />
            )}
          </Box>
        </Stack>

        {/* Statistics */}
        {stats && stats.totalTrainings > 0 ? (
          <Box>
            <Stack
              direction="row"
              spacing={3}
              sx={{ mb: 1.5 }}
              flexWrap="wrap"
            >
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('statistics.totalTrainings')}
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {stats.totalTrainings}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('statistics.attendanceRate')}
                </Typography>
                <Typography
                  variant="h5"
                  fontWeight={700}
                  color={rateColor(stats.attendanceRate)}
                >
                  {stats.attendanceRate}%
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('statistics.attended')}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="success.main">
                  {stats.confirmedCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('profile.declined')}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="error.main">
                  {stats.declinedCount}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  {t('profile.pending')}
                </Typography>
                <Typography variant="h5" fontWeight={700} color="warning.main">
                  {stats.pendingCount}
                </Typography>
              </Box>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={stats.attendanceRate}
              color={rateBarColor(stats.attendanceRate)}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('statistics.noData')}
          </Typography>
        )}
      </Box>
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
