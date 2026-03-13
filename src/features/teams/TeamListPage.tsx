import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add, Groups } from '@mui/icons-material';
import { useTeams } from '@/api/team.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { TeamFormDialog } from './components/TeamFormDialog';

export function TeamListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useAuthStore((s) => s.user?.clubId);
  const { isClubAdmin } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);

  const { data: teams, isLoading } = useTeams(clubId ?? null);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          {t('teams.title')}
        </Typography>
        {isClubAdmin && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setCreateOpen(true)}
          >
            {t('teams.createTeam')}
          </Button>
        )}
      </Box>

      {!teams || teams.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {t('teams.noTeams')}
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
              md: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {teams.map((team) => (
            <Card variant="outlined" key={team.id}>
              <CardActionArea
                onClick={() => navigate(`/teams/${team.id}`)}
              >
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {team.name}
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      flexWrap: 'wrap',
                      mb: 1.5,
                    }}
                  >
                    {team.ageGroup && (
                      <Chip
                        label={team.ageGroup}
                        size="small"
                        variant="outlined"
                      />
                    )}
                    {team.season && (
                      <Chip
                        label={team.season}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('teams.memberCount', { count: team.memberCount })}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      )}

      {clubId && (
        <TeamFormDialog
          open={createOpen}
          clubId={clubId}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </Box>
  );
}
