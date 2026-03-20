import { useEffect, useMemo, useState } from 'react';
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
  TextField,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import { Add, Groups, Search, FitnessCenter } from '@mui/icons-material';
import { useTeams, useTeamMembers } from '@/api/team.api';
import { useTrainings } from '@/api/training.api';
import { useTeamStatistics } from '@/api/statistics.api';
import { useAuthStore } from '@/stores/authStore';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { TeamFormDialog } from './components/TeamFormDialog';
import { clubRoleColors, positionColors } from '@/utils/roles';
import { TrainingSessionStatus } from '@/types/common.types';
import type { PlayerPosition } from '@/types/common.types';
import type { ClubRole } from '@/types/common.types';
import type { TeamDTO } from '@/types/team.types';
import { formatDate, formatTime } from '@/utils/date';
import dayjs from 'dayjs';

// Expanded team card for coaches (1-2 teams) showing members + next training
function ExpandedTeamCard({ team }: { team: TeamDTO }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();

  const { data: members } = useTeamMembers(clubId, team.id);
  const { data: stats } = useTeamStatistics(clubId, team.id);
  const { data: allTrainings } = useTrainings(clubId, true);

  const upcomingForTeam = useMemo(() => {
    if (!allTrainings) return [];
    const today = dayjs().format('YYYY-MM-DD');
    return allTrainings
      .filter(
        (tr) =>
          tr.teamId === team.id &&
          tr.status === TrainingSessionStatus.SCHEDULED &&
          tr.date >= today,
      )
      .sort((a, b) => {
        const d = a.date.localeCompare(b.date);
        return d !== 0 ? d : a.startTime.localeCompare(b.startTime);
      })
      .slice(0, 5);
  }, [allTrainings, team.id]);

  return (
    <Paper variant="outlined" sx={{ mb: 3 }}>
      {/* Team header */}
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' },
        }}
        onClick={() => navigate(`/teams/${team.id}`)}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {team.name}
            </Typography>
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
              {team.ageGroup && (
                <Chip label={team.ageGroup} size="small" variant="outlined" />
              )}
              {team.season && (
                <Chip label={team.season} size="small" variant="outlined" />
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={2} alignItems="center">
            <Chip
              label={t('teams.memberCount', { count: team.memberCount })}
              size="small"
              color="primary"
              variant="outlined"
            />
            {stats && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  {t('dashboard.averageAttendance')}:
                </Typography>
                <Typography
                  variant="body2"
                  fontWeight={700}
                  color={
                    stats.averageAttendanceRate >= 75
                      ? 'success.main'
                      : stats.averageAttendanceRate >= 50
                        ? 'warning.main'
                        : 'error.main'
                  }
                >
                  {Math.round(stats.averageAttendanceRate)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={stats.averageAttendanceRate}
                  color={
                    stats.averageAttendanceRate >= 75
                      ? 'success'
                      : stats.averageAttendanceRate >= 50
                        ? 'warning'
                        : 'error'
                  }
                  sx={{ width: 60, height: 6, borderRadius: 3 }}
                />
              </Stack>
            )}
          </Stack>
        </Stack>
      </Box>

      {/* Two columns: Members + Upcoming trainings */}
      <Stack direction={{ xs: 'column', md: 'row' }} divider={<Box sx={{ borderRight: '1px solid', borderColor: 'divider' }} />}>
        {/* Members */}
        <Box sx={{ flex: 1, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('teams.members')} ({members?.length ?? 0})
          </Typography>
          {members && members.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('teams.memberName')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('teams.memberRole')}</TableCell>
                    {members.some((m) => m.position) && (
                      <TableCell sx={{ fontWeight: 600 }}>{t('teams.position')}</TableCell>
                    )}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.map((member) => (
                    <TableRow
                      key={member.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/members/${member.userId}`)}
                    >
                      <TableCell>
                        {member.firstName} {member.lastName}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={t(`roles.${member.role}`)}
                          size="small"
                          color={(clubRoleColors[member.role as ClubRole] ?? 'default') as 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      {members.some((m) => m.position) && (
                        <TableCell>
                          {member.position ? (
                            <Chip
                              label={t(`positions.${member.position}`)}
                              size="small"
                              sx={{
                                bgcolor:
                                  positionColors[member.position as PlayerPosition] + '1A',
                                color:
                                  positionColors[member.position as PlayerPosition],
                                fontWeight: 600,
                              }}
                            />
                          ) : (
                            '—'
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('teams.noMembers')}
            </Typography>
          )}
        </Box>

        {/* Upcoming trainings */}
        <Box sx={{ flex: 1, p: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1.5 }}>
            {t('dashboard.upcomingTrainings')} ({upcomingForTeam.length})
          </Typography>
          {upcomingForTeam.length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>{t('trainings.date')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('trainings.time')}</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>{t('trainings.pitch')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {upcomingForTeam.map((tr) => (
                    <TableRow
                      key={tr.id}
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/trainings/${tr.id}`)}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>
                        {formatDate(tr.date)}
                      </TableCell>
                      <TableCell>
                        {formatTime(tr.startTime)} – {formatTime(tr.endTime)}
                      </TableCell>
                      <TableCell>{tr.pitchName ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <FitnessCenter sx={{ fontSize: 32, color: 'text.disabled', mb: 1 }} />
              <Typography variant="body2" color="text.secondary">
                {t('dashboard.noUpcoming')}
              </Typography>
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}

export function TeamListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useAuthStore((s) => s.user?.clubId);
  const { isClubAdmin, isPlayer, isParent } = usePermissions();
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data: teams, isLoading } = useTeams(clubId ?? null);

  // Player/Parent with exactly 1 team → redirect straight to team detail
  useEffect(() => {
    if ((isPlayer || isParent) && teams && teams.length === 1) {
      navigate(`/teams/${teams[0]!.id}`, { replace: true });
    }
  }, [isPlayer, isParent, teams, navigate]);

  const filtered = (teams ?? []).filter((team) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      team.name.toLowerCase().includes(q) ||
      team.ageGroup?.toLowerCase().includes(q) ||
      team.season?.toLowerCase().includes(q)
    );
  });

  // Coach/Player with few teams → expanded view
  const useExpandedView = !isClubAdmin && filtered.length <= 3;

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
          mb: 2,
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

      {/* Search (only show when many teams) */}
      {(teams?.length ?? 0) > 4 && (
        <Box sx={{ mb: 3 }}>
          <TextField
            size="small"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
            sx={{ minWidth: 200 }}
          />
        </Box>
      )}

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Groups sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            {t('teams.noTeams')}
          </Typography>
        </Box>
      ) : useExpandedView ? (
        // Expanded view for coaches/players with few teams
        filtered.map((team) => <ExpandedTeamCard key={team.id} team={team} />)
      ) : (
        // Grid view for admins / many teams
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
          {filtered.map((team) => (
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
