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
import { TimeFieldInput } from '@/components/form/TimeFieldInput';
import { useCreateTraining, useUpdateTraining } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import {
  trainingSchema,
  type TrainingFormValues,
} from '@/features/trainings/schemas';
import type { TrainingSessionDTO } from '@/types/training.types';
import { useClubId } from '@/hooks/useClubId';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

interface TrainingFormDialogProps {
  open: boolean;
  onClose: () => void;
  training?: TrainingSessionDTO | null;
  defaultDate?: string;
}

export function TrainingFormDialog({
  open,
  onClose,
  training,
  defaultDate,
}: TrainingFormDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();
  const isEdit = !!training;

  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);

  const createMutation = useCreateTraining(clubId!);
  const updateMutation = useUpdateTraining(clubId!, training?.id ?? '');

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TrainingFormValues>({
    resolver: zodResolver(trainingSchema(t)),
    defaultValues: {
      teamId: '',
      date: '',
      startTime: '',
      endTime: '',
      pitchId: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open && training) {
      reset({
        teamId: training.teamId,
        date: training.date,
        startTime: training.startTime?.slice(0, 5) ?? '',
        endTime: training.endTime?.slice(0, 5) ?? '',
        pitchId: training.pitchId ?? '',
        notes: training.notes ?? '',
      });
    } else if (open) {
      reset({
        teamId: '',
        date: defaultDate ?? '',
        startTime: '',
        endTime: '',
        pitchId: '',
        notes: '',
      });
    }
  }, [open, training, defaultDate, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: TrainingFormValues) => {
    try {
      if (isEdit) {
        await updateMutation.mutateAsync({
          date: values.date,
          startTime: values.startTime,
          endTime: values.endTime,
          pitchId: values.pitchId || undefined,
          notes: values.notes || undefined,
        });
        toast.success(t('trainings.editSuccess'));
      } else {
        await createMutation.mutateAsync({
          teamId: values.teamId,
          data: {
            date: values.date,
            startTime: values.startTime,
            endTime: values.endTime,
            pitchId: values.pitchId || undefined,
            notes: values.notes || undefined,
          },
        });
        toast.success(t('trainings.createSuccess'));
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
        {isEdit ? t('trainings.editTraining') : t('trainings.createTraining')}
      </DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="training-form"
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
          <DateFieldInput
            name="date"
            control={control}
            label={t('trainings.date')}
            format="DD.MM.YYYY"
            required
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
          form="training-form"
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
