import { useState } from 'react';
import { DatePicker, type DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';
import dayjs, { type Dayjs } from 'dayjs';

type DateFieldInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
} & Omit<DatePickerProps<Dayjs>, 'value' | 'onChange'>;

export function DateFieldInput<T extends FieldValues>({
  name,
  control,
  label,
  ...pickerProps
}: DateFieldInputProps<T>) {
  const [open, setOpen] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...pickerProps}
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          label={label}
          value={field.value ? dayjs(field.value) : null}
          onChange={(date) => {
            field.onChange(date ? date.format('YYYY-MM-DD') : '');
          }}
          slotProps={{
            textField: {
              fullWidth: true,
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
