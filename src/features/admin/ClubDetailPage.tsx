import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  IconButton,
  Stack,
} from '@mui/material';
import { ArrowBack, PersonAdd, Delete } from '@mui/icons-material';
import { useAdminClubs, useDeleteClub, useClubMembers } from '@/api/admin.api';
import { AddUserDialog } from '@/features/users/components/AddUserDialog';
import { clubRoleColors } from '@/utils/roles';
import type { ClubRole } from '@/types/common.types';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

export function ClubDetailPage() {
  const { t } = useTranslation();
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const [assignOpen, setAssignOpen] = useState(false);

  const { data: clubsPage, isLoading: clubsLoading } = useAdminClubs({
    page: 0,
    size: 1000,
  });
  const club = clubsPage?.content.find((c) => c.id === clubId);

  const { data: membersPage, isLoading: membersLoading } = useClubMembers(
    clubId!,
    { page: 0, size: 100 },
  );
  const members = membersPage?.content ?? [];

  const deleteClubMutation = useDeleteClub();

  const isLoading = clubsLoading;

  const handleDelete = async () => {
    if (!club) return;
    if (!window.confirm(t('admin.clubs.deleteConfirm', { name: club.name }))) {
      return;
    }
    try {
      await deleteClubMutation.mutateAsync(clubId!);
      toast.success(t('admin.clubs.deleteSuccess'));
      navigate('/admin/clubs');
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

  if (!club) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography color="text.secondary">
          {t('error.notFound')}
        </Typography>
      </Box>
    );
  }

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
          <IconButton onClick={() => navigate('/admin/clubs')}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" fontWeight={700}>
            {club.name}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<PersonAdd />}
            onClick={() => setAssignOpen(true)}
          >
            {t('admin.clubs.addUser')}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            {t('common.delete')}
          </Button>
        </Stack>
      </Box>

      {/* Club Info */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
          {t('admin.clubs.clubInfo')}
        </Typography>
        <Stack spacing={1.5}>
          {club.registrationCode && (
            <InfoRow
              label={t('admin.clubs.registrationCode')}
              value={club.registrationCode}
            />
          )}
          {club.address && (
            <InfoRow label={t('admin.clubs.address')} value={club.address} />
          )}
          {club.contactEmail && (
            <InfoRow
              label={t('admin.clubs.contactEmail')}
              value={club.contactEmail}
            />
          )}
          {club.contactPhone && (
            <InfoRow
              label={t('admin.clubs.contactPhone')}
              value={club.contactPhone}
            />
          )}
        </Stack>
      </Paper>

      {/* Members */}
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {t('admin.clubs.members')} ({members.length})
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t('admin.users.firstName')}</TableCell>
              <TableCell>{t('admin.users.lastName')}</TableCell>
              <TableCell>{t('admin.users.email')}</TableCell>
              <TableCell>{t('admin.clubs.role')}</TableCell>
              <TableCell>{t('admin.users.status')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {membersLoading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : members.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('common.noResults')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>{member.firstName}</TableCell>
                  <TableCell>{member.lastName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    {member.role && (
                      <Chip
                        label={t(`roles.${member.role}`)}
                        size="small"
                        sx={{
                          bgcolor:
                            clubRoleColors[member.role as ClubRole] + '1A',
                          color: clubRoleColors[member.role as ClubRole],
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        member.active
                          ? t('admin.users.active')
                          : t('admin.users.inactive')
                      }
                      size="small"
                      color={member.active ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AddUserDialog
        open={assignOpen}
        clubId={clubId!}
        onClose={() => setAssignOpen(false)}
      />
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', gap: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 160 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
