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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { Home, FlightTakeoff } from '@mui/icons-material';
import { DateFieldInput } from '@/components/form/DateFieldInput';
import { TimeFieldInput } from '@/components/form/TimeFieldInput';
import { useCreateGame, useUpdateGame } from '@/api/game.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import { gameSchema, type GameFormValues } from '@/features/games/schemas';
import type { GameDTO } from '@/types/game.types';
import { VenueType } from '@/types/common.types';
import { useClubId } from '@/hooks/useClubId';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface GameFormDialogProps {
  open: boolean;
  onClose: () => void;
  game?: GameDTO | null;
  defaultDate?: string;
}

export function GameFormDialog({
  open,
  onClose,
  game,
  defaultDate,
}: GameFormDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const isEdit = !!game;

  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);

  const createMutation = useCreateGame(clubId!);
  const updateMutation = useUpdateGame(clubId!, game?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<GameFormValues>({
    resolver: zodResolver(gameSchema(t)),
    defaultValues: {
      teamId: '',
      date: '',
      gatheringTime: '',
      startTime: '',
      endTime: '',
      opponent: '',
      venueType: VenueType.HOME,
      pitchId: '',
      venueName: '',
      venueAddress: '',
      notes: '',
    },
  });

  const venueType = watch('venueType');

  useEffect(() => {
    if (open && game) {
      reset({
        teamId: game.teamId,
        date: game.date,
        gatheringTime: game.gatheringTime?.slice(0, 5) ?? '',
        startTime: game.startTime?.slice(0, 5) ?? '',
        endTime: game.endTime?.slice(0, 5) ?? '',
        opponent: game.opponent,
        venueType: game.venueType,
        pitchId: game.pitchId ?? '',
        venueName: game.venueName ?? '',
        venueAddress: game.venueAddress ?? '',
        notes: game.notes ?? '',
      });
    } else if (open) {
      reset({
        teamId: '',
        date: defaultDate ?? '',
        gatheringTime: '',
        startTime: '',
        endTime: '',
        opponent: '',
        venueType: VenueType.HOME,
        pitchId: '',
        venueName: '',
        venueAddress: '',
        notes: '',
      });
    }
  }, [open, game, defaultDate, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: GameFormValues) => {
    try {
      const payload = {
        date: values.date,
        gatheringTime: values.gatheringTime || undefined,
        startTime: values.startTime,
        endTime: values.endTime,
        opponent: values.opponent,
        venueType: values.venueType,
        pitchId:
          values.venueType === VenueType.HOME
            ? values.pitchId || undefined
            : undefined,
        venueName:
          values.venueType === VenueType.AWAY
            ? values.venueName || undefined
            : undefined,
        venueAddress:
          values.venueType === VenueType.AWAY
            ? values.venueAddress || undefined
            : undefined,
        notes: values.notes || undefined,
      };

      if (isEdit) {
        await updateMutation.mutateAsync(payload);
        toast.success(t('games.editSuccess'));
      } else {
        await createMutation.mutateAsync({
          teamId: values.teamId,
          data: payload,
        });
        toast.success(t('games.createSuccess'));
      }
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {isEdit ? t('games.editGame') : t('games.createGame')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="game-form"
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
            name="opponent"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                fullWidth
                required
                label={t('games.opponent')}
                error={!!errors.opponent}
                helperText={errors.opponent?.message}
              />
            )}
          />
          <DateFieldInput
            name="date"
            control={control}
            label={t('trainings.date')}
            format="DD.MM.YYYY"
            required
          />
          <TimeFieldInput
            name="gatheringTime"
            control={control}
            label={t('games.gatheringTime')}
          />
          <Stack direction="row" spacing={2}>
            <TimeFieldInput
              name="startTime"
              control={control}
              label={t('trainings.startTime')}
              required
            />
            <TimeFieldInput
              name="endTime"
              control={control}
              label={t('trainings.endTime')}
              required
            />
          </Stack>

          {/* Venue Type Toggle */}
          <Controller
            name="venueType"
            control={control}
            render={({ field }) => (
              <Stack spacing={0.5}>
                <Typography variant="body2" color="text.secondary">
                  {t('games.venueType')}
                </Typography>
                <ToggleButtonGroup
                  value={field.value}
                  exclusive
                  onChange={(_, val) => {
                    if (val) field.onChange(val);
                  }}
                  fullWidth
                  size="small"
                >
                  <ToggleButton value={VenueType.HOME}>
                    <Home sx={{ mr: 0.5 }} fontSize="small" />
                    {t('games.home')}
                  </ToggleButton>
                  <ToggleButton value={VenueType.AWAY}>
                    <FlightTakeoff sx={{ mr: 0.5 }} fontSize="small" />
                    {t('games.away')}
                  </ToggleButton>
                </ToggleButtonGroup>
              </Stack>
            )}
          />

          {/* Conditional venue fields */}
          {venueType === VenueType.HOME && (
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
          )}

          {venueType === VenueType.AWAY && (
            <>
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
            </>
          )}

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
          form="game-form"
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
