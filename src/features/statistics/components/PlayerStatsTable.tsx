import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  LinearProgress,
  Box,
} from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { PlayerStatisticsDTO } from '@/types/statistics.types';

interface PlayerStatsTableProps {
  title: string;
  players: PlayerStatisticsDTO[];
  onProfileClick?: (userId: string) => void;
}

type SortKey = 'name' | 'totalTrainings' | 'confirmedCount' | 'attendanceRate';
type SortDir = 'asc' | 'desc';

export function PlayerStatsTable({ title, players, onProfileClick }: PlayerStatsTableProps) {
  const { t } = useTranslation();
  const [sortKey, setSortKey] = useState<SortKey>('attendanceRate');
  const [sortDir, setSortDir] = useState<SortDir>('desc');

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...players].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name':
        cmp = `${a.lastName} ${a.firstName}`.localeCompare(
          `${b.lastName} ${b.firstName}`,
        );
        break;
      case 'totalTrainings':
        cmp = a.totalTrainings - b.totalTrainings;
        break;
      case 'confirmedCount':
        cmp = a.confirmedCount - b.confirmedCount;
        break;
      case 'attendanceRate':
        cmp = a.attendanceRate - b.attendanceRate;
        break;
    }
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const rateColor = (rate: number) =>
    rate >= 75 ? 'success.main' : rate >= 50 ? 'warning.main' : 'error.main';

  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'name'}
                  direction={sortKey === 'name' ? sortDir : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  {t('statistics.playerName')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortKey === 'totalTrainings'}
                  direction={sortKey === 'totalTrainings' ? sortDir : 'asc'}
                  onClick={() => handleSort('totalTrainings')}
                >
                  {t('statistics.trainings')}
                </TableSortLabel>
              </TableCell>
              <TableCell align="center">
                <TableSortLabel
                  active={sortKey === 'confirmedCount'}
                  direction={sortKey === 'confirmedCount' ? sortDir : 'asc'}
                  onClick={() => handleSort('confirmedCount')}
                >
                  {t('statistics.attended')}
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortKey === 'attendanceRate'}
                  direction={sortKey === 'attendanceRate' ? sortDir : 'asc'}
                  onClick={() => handleSort('attendanceRate')}
                >
                  {t('statistics.attendanceRate')}
                </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((player) => (
              <TableRow key={player.userId}>
                <TableCell
                  sx={onProfileClick ? {
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  } : undefined}
                  onClick={onProfileClick ? () => onProfileClick(player.userId) : undefined}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {player.firstName} {player.lastName}
                  </Typography>
                </TableCell>
                <TableCell align="center">{player.totalTrainings}</TableCell>
                <TableCell align="center">{player.confirmedCount}</TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      minWidth: 120,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={player.attendanceRate}
                      sx={{
                        flex: 1,
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'divider',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 3,
                          bgcolor: rateColor(player.attendanceRate),
                        },
                      }}
                    />
                    <Typography
                      variant="body2"
                      fontWeight={600}
                      sx={{ minWidth: 42, textAlign: 'right' }}
                    >
                      {player.attendanceRate}%
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {sorted.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.noResults')}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
