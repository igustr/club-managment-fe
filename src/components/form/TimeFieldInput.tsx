import { TimePicker, type TimePickerProps } from '@mui/x-date-pickers/TimePicker';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import dayjs, { type Dayjs } from 'dayjs';

type TimeFieldInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
} & Omit<TimePickerProps<Dayjs>, 'value' | 'onChange'>;

export function TimeFieldInput<T extends FieldValues>({
  name,
  control,
  label,
  ...pickerProps
}: TimeFieldInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePicker
          {...pickerProps}
          label={label}
          value={field.value ? dayjs(field.value, 'HH:mm') : null}
          onChange={(time) => {
            field.onChange(time ? time.format('HH:mm') : '');
          }}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              error: !!error,
              helperText: error?.message,
            },
          }}
        />
      )}
    />
  );
}
