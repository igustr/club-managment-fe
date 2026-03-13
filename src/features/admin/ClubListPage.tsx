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
  IconButton,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material';
import { Add, Search, Delete } from '@mui/icons-material';
import { useAdminClubs, useDeleteClub } from '@/api/admin.api';
import { CreateClubDialog } from './components/CreateClubDialog';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ClubListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = useAdminClubs({
    search: search || undefined,
    page,
    size: rowsPerPage,
  });

  const deleteClubMutation = useDeleteClub();

  const clubs = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  const handleDelete = async (e: React.MouseEvent, clubId: string, clubName: string) => {
    e.stopPropagation();
    if (!window.confirm(t('admin.clubs.deleteConfirm', { name: clubName }))) {
      return;
    }
    try {
      await deleteClubMutation.mutateAsync(clubId);
      toast.success(t('admin.clubs.deleteSuccess'));
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
          {t('admin.clubs.title')}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateOpen(true)}
        >
          {t('admin.clubs.createClub')}
        </Button>
      </Box>

      <TextField
        placeholder={t('common.search')}
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(0);
        }}
        size="small"
        sx={{ mb: 3, width: 320 }}
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

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.clubs.name')}</TableCell>
              <TableCell>{t('admin.clubs.registrationCode')}</TableCell>
              <TableCell>{t('admin.clubs.address')}</TableCell>
              <TableCell>{t('admin.clubs.contactEmail')}</TableCell>
              <TableCell>{t('admin.clubs.contactPhone')}</TableCell>
              <TableCell align="right" sx={{ width: 60 }} />
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : clubs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('admin.clubs.noClubs')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              clubs.map((club) => (
                <TableRow
                  key={club.id}
                  hover
                  sx={{ cursor: 'pointer' }}
                  onClick={() => navigate(`/admin/clubs/${club.id}`)}
                >
                  <TableCell>
                    <Typography fontWeight={600}>{club.name}</Typography>
                  </TableCell>
                  <TableCell>
                    {club.registrationCode ? (
                      <Chip
                        label={club.registrationCode}
                        size="small"
                        variant="outlined"
                      />
                    ) : (
                      '—'
                    )}
                  </TableCell>
                  <TableCell>{club.address || '—'}</TableCell>
                  <TableCell>{club.contactEmail || '—'}</TableCell>
                  <TableCell>{club.contactPhone || '—'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title={t('common.delete')}>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => handleDelete(e, club.id, club.name)}
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

      <CreateClubDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </Box>
  );
}
