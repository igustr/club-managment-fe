import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
  MenuItem,
  Stack,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add,
  ViewList,
  CalendarMonth,
  Repeat,
  CheckCircle,
  Cancel,
  HourglassEmpty,
  ExpandMore,
  ChevronRight,
} from '@mui/icons-material';
import { useTrainings } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { useMyAttendances } from '@/api/attendance.api';
import { TrainingFormDialog } from './components/TrainingFormDialog';
import { RecurringTrainingDialog } from './components/RecurringTrainingDialog';
import { usePermissions } from '@/hooks/usePermissions';
import { useClubId } from '@/hooks/useClubId';
import { formatDate, formatTime } from '@/utils/date';
import { TrainingSessionStatus, AttendanceStatus } from '@/types/common.types';
import dayjs from 'dayjs';

const statusColors: Record<
  TrainingSessionStatus,
  'primary' | 'error' | 'success'
> = {
  [TrainingSessionStatus.SCHEDULED]: 'primary',
  [TrainingSessionStatus.CANCELLED]: 'error',
  [TrainingSessionStatus.COMPLETED]: 'success',
};

export function TrainingListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const { canCreateTraining, isClubAdmin, isPlayer, isParent } = usePermissions();
  const showAttendance = isPlayer || isParent;
  const [myTeamsOnly, setMyTeamsOnly] = useState(false);

  const { data: trainings, isLoading } = useTrainings(clubId, myTeamsOnly);
  const { data: teams } = useTeams(clubId);
  const { data: myAttendances } = useMyAttendances(showAttendance ? clubId : null);

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceStatus> = {};
    myAttendances?.forEach((a) => {
      map[a.trainingSessionId] = a.status;
    });
    return map;
  }, [myAttendances]);

  const [teamFilter, setTeamFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  const toggleMonth = (monthKey: string) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    if (!trainings) return [];
    return trainings.filter((tr) => {
      if (teamFilter && tr.teamId !== teamFilter) return false;
      if (statusFilter && tr.status !== statusFilter) return false;
      return true;
    });
  }, [trainings, teamFilter, statusFilter]);

  const sorted = useMemo(
    () =>
      [...filtered].sort((a, b) => {
        const dateCmp = a.date.localeCompare(b.date);
        if (dateCmp !== 0) return dateCmp;
        return a.startTime.localeCompare(b.startTime);
      }),
    [filtered],
  );

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
        <Typography variant="h5" fontWeight={700}>
          {t('trainings.title')}
        </Typography>
        {canCreateTraining && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<Repeat />}
              onClick={() => setRecurringOpen(true)}
            >
              {t('trainings.createRecurring')}
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setFormOpen(true)}
            >
              {t('trainings.createTraining')}
            </Button>
          </Stack>
        )}
      </Box>

      {/* Filters */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'center',
          mb: 3,
          flexWrap: 'wrap',
        }}
      >
        <TextField
          select
          size="small"
          value={teamFilter}
          onChange={(e) => setTeamFilter(e.target.value)}
          label={t('trainings.team')}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">{t('trainings.allTeams')}</MenuItem>
          {(teams ?? []).map((team) => (
            <MenuItem key={team.id} value={team.id}>
              {team.name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          size="small"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          label={t('trainings.status')}
          sx={{ minWidth: 140 }}
        >
          <MenuItem value="">{t('trainings.allStatuses')}</MenuItem>
          <MenuItem value={TrainingSessionStatus.SCHEDULED}>
            {t('trainings.statusScheduled')}
          </MenuItem>
          <MenuItem value={TrainingSessionStatus.CANCELLED}>
            {t('trainings.statusCancelled')}
          </MenuItem>
          <MenuItem value={TrainingSessionStatus.COMPLETED}>
            {t('trainings.statusCompleted')}
          </MenuItem>
        </TextField>
        {isClubAdmin && (
          <FormControlLabel
            control={
              <Switch
                checked={myTeamsOnly}
                onChange={(e) => setMyTeamsOnly(e.target.checked)}
                size="small"
              />
            }
            label={t('teams.myTeamsOnly')}
          />
        )}
        <Box sx={{ flexGrow: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, val) => {
            if (val === 'calendar') {
              navigate('/calendar');
            } else if (val) {
              setViewMode(val);
            }
          }}
          size="small"
        >
          <ToggleButton value="list">
            <ViewList fontSize="small" />
          </ToggleButton>
          <ToggleButton value="calendar">
            <CalendarMonth fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : sorted.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <CalendarMonth
            sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }}
          />
          <Typography color="text.secondary">
            {t('trainings.noTrainings')}
          </Typography>
        </Box>
      ) : (
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('trainings.date')}</TableCell>
                <TableCell>{t('trainings.time')}</TableCell>
                <TableCell>{t('trainings.team')}</TableCell>
                <TableCell>{t('trainings.pitch')}</TableCell>
                {showAttendance ? (
                  <TableCell>{t('trainings.myAttendance')}</TableCell>
                ) : (
                  <TableCell>{t('trainings.status')}</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((tr, idx) => {
                const monthKey = dayjs(tr.date).format('YYYY-MM');
                const prevMonthKey = idx > 0 ? dayjs(sorted[idx - 1]!.date).format('YYYY-MM') : null;
                const showMonthHeader = monthKey !== prevMonthKey;
                const monthLabel = dayjs(tr.date).format('MMMM YYYY');
                const isCollapsed = collapsedMonths.has(monthKey);
                const monthCount = sorted.filter((t) => dayjs(t.date).format('YYYY-MM') === monthKey).length;

                return (
                  <React.Fragment key={tr.id}>
                    {showMonthHeader && (
                      <TableRow
                        onClick={() => toggleMonth(monthKey)}
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.selected' } }}
                      >
                        <TableCell
                          colSpan={5}
                          sx={{
                            bgcolor: 'action.hover',
                            py: 1,
                            borderBottom: '2px solid',
                            borderColor: 'divider',
                          }}
                        >
                          <Stack direction="row" alignItems="center" spacing={1}>
                            {isCollapsed ? (
                              <ChevronRight fontSize="small" color="action" />
                            ) : (
                              <ExpandMore fontSize="small" color="action" />
                            )}
                            <Typography variant="subtitle2" fontWeight={700} sx={{ textTransform: 'capitalize' }}>
                              {monthLabel}
                            </Typography>
                            <Chip label={monthCount} size="small" variant="outlined" sx={{ height: 20, fontSize: 11 }} />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                    {!isCollapsed && (
                    <TableRow
                      hover
                      sx={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/trainings/${tr.id}`)}
                    >
                      <TableCell>{formatDate(tr.date)}</TableCell>
                      <TableCell>
                        {formatTime(tr.startTime)} – {formatTime(tr.endTime)}
                      </TableCell>
                      <TableCell>
                        <Chip label={tr.teamName} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{tr.pitchName ?? '—'}</TableCell>
                      {showAttendance ? (
                        <TableCell>
                          {(() => {
                            const status = attendanceMap[tr.id];
                            if (status === AttendanceStatus.CONFIRMED) {
                              return (
                                <Chip
                                  icon={<CheckCircle fontSize="small" />}
                                  label={t('attendance.confirmed')}
                                  size="small"
                                  color="success"
                                  variant="outlined"
                                />
                              );
                            }
                            if (status === AttendanceStatus.DECLINED) {
                              return (
                                <Chip
                                  icon={<Cancel fontSize="small" />}
                                  label={t('attendance.declined')}
                                  size="small"
                                  color="error"
                                  variant="outlined"
                                />
                              );
                            }
                            return (
                              <Chip
                                icon={<HourglassEmpty fontSize="small" />}
                                label={t('attendance.pending')}
                                size="small"
                                variant="outlined"
                              />
                            );
                          })()}
                        </TableCell>
                      ) : (
                        <TableCell>
                          <Chip
                            label={t(`trainings.status${tr.status.charAt(0) + tr.status.slice(1).toLowerCase()}`)}
                            size="small"
                            color={statusColors[tr.status]}
                            variant="outlined"
                          />
                        </TableCell>
                      )}
                    </TableRow>
                    )}
                  </React.Fragment>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TrainingFormDialog
        open={formOpen}
        onClose={() => setFormOpen(false)}
      />

      <RecurringTrainingDialog
        open={recurringOpen}
        onClose={() => setRecurringOpen(false)}
      />
    </Box>
  );
}
