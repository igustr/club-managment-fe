import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Typography, Box, Paper, Stack } from '@mui/material';
import { Groups, Person, FitnessCenter, SportsSoccer } from '@mui/icons-material';
import { useClubUsers } from '@/api/user.api';
import { useClub } from '@/api/club.api';
import { useClubId } from '@/hooks/useClubId';
import { usePermissions } from '@/hooks/usePermissions';

function StatCard({
  title,
  value,
  icon,
  onClick,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: 3,
        flex: 1,
        minWidth: 200,
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick
          ? { borderColor: 'primary.main', bgcolor: 'action.hover' }
          : {},
      }}
      onClick={onClick}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Box
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            borderRadius: 2,
            p: 1,
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h4" fontWeight={700}>
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { isClubAdmin } = usePermissions();
  const { data: club } = useClub(clubId);
  const { data: usersPage } = useClubUsers(clubId, { page: 0, size: 1 });

  const memberCount = usersPage?.totalElements ?? 0;

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>
        {t('nav.dashboard')}
      </Typography>
      {club && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {club.name}
        </Typography>
      )}

      <Stack direction="row" flexWrap="wrap" gap={2}>
        <StatCard
          title={t('dashboard.members')}
          value={memberCount}
          icon={<Person />}
          onClick={isClubAdmin ? () => navigate('/users') : undefined}
        />
        <StatCard
          title={t('dashboard.teams')}
          value="—"
          icon={<Groups />}
          onClick={() => navigate('/teams')}
        />
        <StatCard
          title={t('dashboard.trainings')}
          value="—"
          icon={<FitnessCenter />}
          onClick={() => navigate('/trainings')}
        />
        <StatCard
          title={t('dashboard.pitches')}
          value="—"
          icon={<SportsSoccer />}
          onClick={() => navigate('/pitches')}
        />
      </Stack>
    </Box>
  );
}
