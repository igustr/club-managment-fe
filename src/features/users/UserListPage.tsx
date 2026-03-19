import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
} from '@mui/material';
import { Add, Search, Delete } from '@mui/icons-material';
import { useClubUsers, useRemoveClubUser } from '@/api/user.api';
import { useClubId } from '@/hooks/useClubId';
import { clubRoleColors } from '@/utils/roles';
import { AddUserDialog } from './components/AddUserDialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { ClubRole } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function UserListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const clubId = useClubId();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const roleOptions = ['CLUB_ADMIN', 'COACH', 'PLAYER', 'PARENT'] as const;

  const { data, isLoading } = useClubUsers(clubId, {
    search: search || undefined,
    role: roleFilter || undefined,
    page,
    size: rowsPerPage,
  });

  const removeMutation = useRemoveClubUser(clubId!);

  const users = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await removeMutation.mutateAsync(deleteTarget.id);
      toast.success(t('users.removeSuccess'));
      setDeleteTarget(null);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

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
          {t('users.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddOpen(true)}
        >
          {t('users.addUser')}
        </Button>
      </Box>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }} flexWrap="wrap">
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
        <Stack direction="row" spacing={0.5}>
          <Chip
            label={t('common.all')}
            size="small"
            variant={roleFilter === null ? 'filled' : 'outlined'}
            color={roleFilter === null ? 'primary' : 'default'}
            onClick={() => {
              setRoleFilter(null);
              setPage(0);
            }}
          />
          {roleOptions.map((role) => (
            <Chip
              key={role}
              label={t(`roles.${role}`)}
              size="small"
              variant={roleFilter === role ? 'filled' : 'outlined'}
              color={roleFilter === role ? 'primary' : 'default'}
              onClick={() => {
                setRoleFilter(roleFilter === role ? null : role);
                setPage(0);
              }}
            />
          ))}
        </Stack>
      </Stack>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('users.firstName')}</TableCell>
              <TableCell>{t('users.lastName')}</TableCell>
              <TableCell>{t('users.email')}</TableCell>
              <TableCell>{t('users.phone')}</TableCell>
              <TableCell>{t('users.role')}</TableCell>
              <TableCell>{t('users.status')}</TableCell>
              <TableCell align="right" sx={{ width: 60 }} />
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
                    {t('users.noUsers')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow
                  key={user.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/users/${user.id}`)}
                >
                  <TableCell>{user.firstName}</TableCell>
                  <TableCell>{user.lastName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone || '—'}</TableCell>
                  <TableCell>
                    {user.role && (
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
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        user.active
                          ? t('users.active')
                          : t('users.inactive')
                      }
                      size="small"
                      color={user.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('users.removeUser')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget({
                            id: user.id,
                            name: `${user.firstName} ${user.lastName}`,
                          });
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
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

      <AddUserDialog
        open={addOpen}
        clubId={clubId!}
        onClose={() => setAddOpen(false)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={t('users.removeConfirmTitle')}
        message={t('users.removeConfirm', { name: deleteTarget?.name })}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={removeMutation.isPending}
      />
    </Box>
  );
}
