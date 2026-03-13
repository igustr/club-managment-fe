import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  CircularProgress,
  Chip,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useAdminUsers } from '@/api/admin.api';
import { CreateUserDialog } from './components/CreateUserDialog';
import { clubRoleColors } from '@/utils/roles';
import type { ClubRole } from '@/types/common.types';

export function UserListPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filter, setFilter] = useState<'all' | 'unaffiliated'>('all');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useAdminUsers({
    search: search || undefined,
    unaffiliated: filter === 'unaffiliated' ? true : undefined,
    page,
    size: rowsPerPage,
  });

  const users = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

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
          {t('admin.users.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
        >
          {t('admin.users.createUser')}
        </Button>
      </Box>

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
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          size="small"
          sx={{ width: 320 }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, val) => {
            if (val) {
              setFilter(val);
              setPage(0);
            }
          }}
          size="small"
        >
          <ToggleButton value="all">{t('admin.users.filterAll')}</ToggleButton>
          <ToggleButton value="unaffiliated">
            {t('admin.users.filterUnaffiliated')}
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.users.firstName')}</TableCell>
              <TableCell>{t('admin.users.lastName')}</TableCell>
              <TableCell>{t('admin.users.email')}</TableCell>
              <TableCell>{t('admin.users.phone')}</TableCell>
              <TableCell>{t('admin.users.club')}</TableCell>
              <TableCell>{t('admin.users.role')}</TableCell>
              <TableCell>{t('admin.users.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.users.noUsers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>
                    {user.clubId ? (
                      <Chip label={user.clubId.slice(0, 8)} size="small" variant="outlined" />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.users.noClub')}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.systemRole ? (
                      <Chip
                        label={t(`roles.${user.systemRole}`)}
                        size="small"
                        color="secondary"
                      />
                    ) : user.role ? (
                      <Chip
                        label={t(`roles.${user.role}`)}
                        size="small"
                        sx={{
                          bgcolor:
                            clubRoleColors[user.role as ClubRole] + '1A',
                          color: clubRoleColors[user.role as ClubRole],
                          fontWeight: 600,
                        }}
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.active
                          ? t('admin.users.active')
                          : t('admin.users.inactive')
                      }
                      size="small"
                      color={user.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {totalElements > 0 && (
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[5, 10, 25]}
          />
        )}
      </TableContainer>

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
