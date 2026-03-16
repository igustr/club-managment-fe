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
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
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
import dayjs from 'dayjs';

interface TrainingFormDialogProps {
  open: boolean;
  onClose: () => void;
  training?: TrainingSessionDTO | null;
}

export function TrainingFormDialog({
  open,
  onClose,
  training,
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
        date: '',
        startTime: '',
        endTime: '',
        pitchId: '',
        notes: '',
      });
    }
  }, [open, training, reset]);

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
            name="date"
            control={control}
            render={({ field }) => (
              <DatePicker
                label={t('trainings.date')}
                value={field.value ? dayjs(field.value) : null}
                onChange={(val) =>
                  field.onChange(val ? val.format('YYYY-MM-DD') : '')
                }
                format="DD.MM.YYYY"
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.date,
                    helperText: errors.date?.message,
                  },
                }}
              />
            )}
          />
          <Stack direction="row" spacing={2}>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label={t('trainings.startTime')}
                  value={
                    field.value
                      ? dayjs(`2000-01-01T${field.value}`)
                      : null
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.format('HH:mm') : '')
                  }
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.startTime,
                      helperText: errors.startTime?.message,
                    },
                  }}
                />
              )}
            />
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <TimePicker
                  label={t('trainings.endTime')}
                  value={
                    field.value
                      ? dayjs(`2000-01-01T${field.value}`)
                      : null
                  }
                  onChange={(val) =>
                    field.onChange(val ? val.format('HH:mm') : '')
                  }
                  ampm={false}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!errors.endTime,
                      helperText: errors.endTime?.message,
                    },
                  }}
                />
              )}
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
