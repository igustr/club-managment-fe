import { useState } from 'react';
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
  required?: boolean;
} & Omit<TimePickerProps<Dayjs>, 'value' | 'onChange'>;

export function TimeFieldInput<T extends FieldValues>({
  name,
  control,
  label,
  required,
  ...pickerProps
}: TimeFieldInputProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TimePicker
          {...pickerProps}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          label={label}
          value={field.value ? dayjs(field.value, 'HH:mm') : null}
          onChange={(time) => {
            field.onChange(time ? time.format('HH:mm') : '');
          }}
          ampm={false}
          slotProps={{
            textField: {
              fullWidth: true,
              required,
              error: !!error,
              helperText: error?.message,
              onClick: () => setOpen(true),
            },
          }}
        />
      )}
    />
  );
}
