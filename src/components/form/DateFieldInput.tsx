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
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <DatePicker
          {...pickerProps}
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
            },
          }}
        />
      )}
    />
  );
}
