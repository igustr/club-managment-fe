import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  MenuItem,
} from '@mui/material';
import { DateFieldInput } from '@/components/form/DateFieldInput';
import {
  useCreateTournament,
  useUpdateTournament,
} from '@/api/tournament.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import {
  tournamentSchema,
  type TournamentFormValues,
} from '@/features/tournaments/schemas';
import type { TournamentDTO } from '@/types/tournament.types';
import { useClubId } from '@/hooks/useClubId';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface TournamentFormDialogProps {
  open: boolean;
  onClose: () => void;
  tournament?: TournamentDTO | null;
}

export function TournamentFormDialog({
  open,
  onClose,
  tournament,
}: TournamentFormDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const isEdit = !!tournament;

  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);

  const createMutation = useCreateTournament(clubId!);
  const updateMutation = useUpdateTournament(
    clubId!,
    tournament?.id ?? '',
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentSchema(t)),
    defaultValues: {
      teamId: '',
      name: '',
      startDate: '',
      endDate: '',
      pitchId: '',
      venueName: '',
      venueAddress: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && tournament) {
      reset({
        teamId: tournament.teamId,
        name: tournament.name,
        startDate: tournament.startDate,
        endDate: tournament.endDate,
        pitchId: tournament.pitchId ?? '',
        venueName: tournament.venueName ?? '',
        venueAddress: tournament.venueAddress ?? '',
        notes: tournament.notes ?? '',
      });
    } else if (open) {
      reset({
        teamId: '',
        name: '',
        startDate: '',
        endDate: '',
        pitchId: '',
        venueName: '',
        venueAddress: '',
        notes: '',
      });
    }
  }, [open, tournament, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: TournamentFormValues) => {
    try {
      const payload = {
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        pitchId: values.pitchId || undefined,
        venueName: values.venueName || undefined,
        venueAddress: values.venueAddress || undefined,
        notes: values.notes || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success(t('tournaments.editSuccess'));
      } else {
        await createMutation.mutateAsync({
          teamId: values.teamId,
          data: payload,
        });
        toast.success(t('tournaments.createSuccess'));
      }
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending =
    createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit
          ? t('tournaments.editTournament')
          : t('tournaments.createTournament')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="tournament-form"
          onSubmit={handleSubmit(onSubmit)}
          spacing={2.5}
          sx={{ mt: 1 }}
        >
          <Controller
            name="teamId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                required
                label={t('trainings.team')}
                error={!!errors.teamId}
                helperText={errors.teamId?.message}
                disabled={isEdit}
              >
                {(teams ?? []).map((team) => (
                  <MenuItem key={team.id} value={team.id}>
                    {team.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label={t('tournaments.name')}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <DateFieldInput
              name="startDate"
              control={control}
              label={t('tournaments.startDate')}
              format="DD.MM.YYYY"
              required
            />
            <DateFieldInput
              name="endDate"
              control={control}
              label={t('tournaments.endDate')}
              format="DD.MM.YYYY"
              required
            />
          </Stack>

          <Controller
            name="pitchId"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                label={t('trainings.pitch')}
                error={!!errors.pitchId}
                helperText={errors.pitchId?.message}
              >
                <MenuItem value="">
                  <em>{t('trainings.noPitch')}</em>
                </MenuItem>
                {(pitches ?? []).map((pitch) => (
                  <MenuItem key={pitch.id} value={pitch.id}>
                    {pitch.name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Controller
            name="venueName"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('games.venueName')}
                error={!!errors.venueName}
                helperText={errors.venueName?.message}
              />
            )}
          />
          <Controller
            name="venueAddress"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('games.venueAddress')}
                error={!!errors.venueAddress}
                helperText={errors.venueAddress?.message}
              />
            )}
          />
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                label={t('trainings.notes')}
                multiline
                rows={3}
                error={!!errors.notes}
                helperText={errors.notes?.message}
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>{t('common.cancel')}</Button>
        <Button
          type="submit"
          form="tournament-form"
          variant="contained"
          disabled={isPending}
        >
          {isPending
            ? t('common.loading')
            : isEdit
              ? t('common.save')
              : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
