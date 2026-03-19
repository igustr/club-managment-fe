import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Stack,
  Paper,
  CircularProgress,
  Button,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { ArrowBack, Chat } from '@mui/icons-material';
import { useClubUser, useParents } from '@/api/user.api';
import { usePlayerStatistics } from '@/api/statistics.api';
import { useCreateDirectConversation } from '@/api/chat.api';
import { useClubId } from '@/hooks/useClubId';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { clubRoleColors } from '@/utils/roles';
import { formatDate, dayjs } from '@/utils/date';
import type { ClubRole } from '@/types/common.types';
import type { UserDTO } from '@/types/auth.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function MemberProfilePage() {
  const { t } = useTranslation();
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const clubId = useClubId();
  const currentUserId = useAuthStore((s) => s.user?.id);
  const { canViewStatistics } = usePermissions();
  const isOwnProfile = userId === currentUserId;

  const { data: user, isLoading } = useClubUser(clubId, userId);
  const { data: parents } = useParents(
    clubId,
    user?.role === 'PLAYER' ? userId : undefined,
  );

  const isPlayer = user?.role === 'PLAYER';
  const showStats = isPlayer && canViewStatistics;

  const { data: playerStats } = usePlayerStatistics(
    showStats ? clubId : null,
    showStats ? userId : null,
  );

  const createDmMutation = useCreateDirectConversation(clubId ?? '');

  const age = useMemo(() => {
    if (!user?.dateOfBirth) return null;
    return dayjs().diff(dayjs(user.dateOfBirth), 'year');
  }, [user?.dateOfBirth]);

  const handleSendMessage = async (targetUserId: string) => {
    try {
      const conversation = await createDmMutation.mutateAsync({
        participantId: targetUserId,
      });
      navigate(`/chat/${conversation.id}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          {t('error.notFound')}
        </Typography>
      </Box>
    );
  }

  const rateColor = (rate: number) =>
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  const rateBarColor = (rate: number): 'success' | 'warning' | 'error' =>
    rate >= 75 ? 'success' : rate >= 50 ? 'warning' : 'error';

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            {t('profile.title')}
          </Typography>
        </Stack>
        {!isOwnProfile && (
          <Button
            variant="contained"
            startIcon={<Chat />}
            onClick={() => handleSendMessage(user.id)}
            disabled={createDmMutation.isPending}
          >
            {t('profile.sendMessage')}
          </Button>
        )}
      </Box>

      {/* Profile card */}
      <Paper
        variant="outlined"
        sx={{
          overflow: 'hidden',
          mb: 3,
        }}
      >
        {/* Hero */}
        <Box
          sx={{
            bgcolor: 'primary.dark',
            px: 3,
            py: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <Avatar
            src={user.photoUrl ?? undefined}
            sx={{
              width: 80,
              height: 80,
              fontSize: 28,
              fontWeight: 700,
              bgcolor: 'rgba(255,255,255,0.15)',
              border: '2px solid rgba(255,255,255,0.25)',
            }}
          >
            {user.firstName.charAt(0)}
            {user.lastName.charAt(0)}
          </Avatar>

          <Box>
            <Typography variant="h5" fontWeight={700} sx={{ color: '#fff' }}>
              {user.firstName} {user.lastName}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
              {user.role && (
                <Chip
                  label={t(`roles.${user.role}`)}
                  size="small"
                  sx={{
                    bgcolor: clubRoleColors[user.role as ClubRole] + '33',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                  }}
                />
              )}
              {user.position && (
                <Chip
                  label={t(`positions.${user.position}`)}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    color: 'rgba(255,255,255,0.85)',
                    fontWeight: 500,
                    fontSize: 12,
                  }}
                />
              )}
            </Stack>
          </Box>
        </Box>

        {/* Info grid */}
        <Box sx={{ px: 3, py: 2.5 }}>
          <Typography
            variant="overline"
            color="text.secondary"
            sx={{ fontSize: 11, letterSpacing: 0.8 }}
          >
            {t('profile.personalInfo')}
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' },
              gap: 2.5,
              mt: 1.5,
            }}
          >
            {age !== null && (
              <InfoItem
                label={t('profile.age')}
                value={t('profile.years', { count: age })}
              />
            )}
            {user.dateOfBirth && (
              <InfoItem
                label={t('profile.dateOfBirth')}
                value={formatDate(user.dateOfBirth)}
              />
            )}
            <InfoItem label={t('profile.email')} value={user.email} />
            {user.phone && (
              <InfoItem label={t('profile.phone')} value={user.phone} />
            )}
          </Box>
        </Box>
      </Paper>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        {/* Attendance stats — players only, visible to coaches/admins */}
        {showStats && playerStats && (
          <Box sx={{ flex: 1.5 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2.5 }}>
                {t('profile.attendanceStats')}
              </Typography>

              {/* Summary cards */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 2,
                  mb: 3,
                }}
              >
                <StatMiniCard
                  label={t('profile.totalTrainings')}
                  value={playerStats.totalTrainings}
                />
                <StatMiniCard
                  label={t('profile.attended')}
                  value={playerStats.confirmedCount}
                  color="success.main"
                />
                <StatMiniCard
                  label={t('profile.declined')}
                  value={playerStats.declinedCount}
                  color="error.main"
                />
                <StatMiniCard
                  label={t('profile.pending')}
                  value={playerStats.pendingCount}
                  color="text.secondary"
                />
              </Box>

              {/* Attendance rate bar */}
              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                >
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.attendanceRate')}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={rateColor(playerStats.attendanceRate)}
                  >
                    {playerStats.attendanceRate}%
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={playerStats.attendanceRate}
                  color={rateBarColor(playerStats.attendanceRate)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>
            </Paper>
          </Box>
        )}

        {/* Parents — players only */}
        {parents && parents.length > 0 && (
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                {t('profile.parents')}
              </Typography>
              <Stack spacing={0}>
                {parents.map((parent: UserDTO) => (
                  <Box
                    key={parent.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      py: 1.5,
                      '&:not(:last-child)': {
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                      },
                    }}
                  >
                    <Avatar
                      sx={{ width: 36, height: 36, fontSize: 13, fontWeight: 600 }}
                    >
                      {parent.firstName.charAt(0)}
                      {parent.lastName.charAt(0)}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {parent.firstName} {parent.lastName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {parent.email}
                        {parent.phone ? ` · ${parent.phone}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title={t('profile.sendMessage')}>
                      <IconButton
                        size="small"
                        onClick={() => handleSendMessage(parent.id)}
                        disabled={createDmMutation.isPending}
                      >
                        <Chat fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Box>
        )}
      </Stack>
    </Box>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}

function StatMiniCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <Box
      sx={{
        textAlign: 'center',
        p: 1.5,
        bgcolor: 'background.default',
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h5"
        fontWeight={700}
        color={color ?? 'text.primary'}
      >
        {value}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
