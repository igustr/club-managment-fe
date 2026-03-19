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
import { useCreateRecurringTraining } from '@/api/training.api';
import { useTeams } from '@/api/team.api';
import { usePitches } from '@/api/pitch.api';
import {
  recurringTrainingSchema,
  type RecurringTrainingFormValues,
} from '@/features/trainings/schemas';
import { useClubId } from '@/hooks/useClubId';
import toast from 'react-hot-toast';
import { getApiErrorMessage } from '@/api/axios';

const DAYS_OF_WEEK = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

interface RecurringTrainingDialogProps {
  open: boolean;
  onClose: () => void;
}

export function RecurringTrainingDialog({
  open,
  onClose,
}: RecurringTrainingDialogProps) {
  const { t } = useTranslation();
  const clubId = useClubId();

  const { data: teams } = useTeams(clubId);
  const { data: pitches } = usePitches(clubId);
  const createMutation = useCreateRecurringTraining(clubId!);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RecurringTrainingFormValues>({
    resolver: zodResolver(recurringTrainingSchema(t)),
    defaultValues: {
      teamId: '',
      startDate: '',
      endDate: '',
      dayOfWeek: '',
      startTime: '',
      endTime: '',
      pitchId: '',
      notes: '',
    },
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values: RecurringTrainingFormValues) => {
    try {
      const result = await createMutation.mutateAsync({
        teamId: values.teamId,
        data: {
          startDate: values.startDate,
          endDate: values.endDate,
          dayOfWeek: values.dayOfWeek,
          startTime: values.startTime,
          endTime: values.endTime,
          pitchId: values.pitchId || undefined,
          notes: values.notes || undefined,
        },
      });
      toast.success(
        t('trainings.recurringSuccess', { count: result.length }),
      );
      handleClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{t('trainings.createRecurring')}</DialogTitle>
      <DialogContent>
        <Stack
          component="form"
          id="recurring-training-form"
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
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                select
                fullWidth
                required
                label={t('trainings.dayOfWeek')}
                error={!!errors.dayOfWeek}
                helperText={errors.dayOfWeek?.message}
              >
                {DAYS_OF_WEEK.map((day) => (
                  <MenuItem key={day} value={day}>
                    {t(`trainings.days.${day}`)}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
          <Stack direction="row" spacing={2}>
            <DateFieldInput
              name="startDate"
              control={control}
              label={t('trainings.startDate')}
              format="DD.MM.YYYY"
              required
            />
            <DateFieldInput
              name="endDate"
              control={control}
              label={t('trainings.endDate')}
              format="DD.MM.YYYY"
              required
            />
          </Stack>
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
          form="recurring-training-form"
          variant="contained"
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? t('common.loading') : t('common.create')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
