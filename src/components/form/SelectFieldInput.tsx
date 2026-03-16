import {
  FormControl,
  FormHelperText,
  InputLabel,
  Select,
  type SelectProps,
} from '@mui/material';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type SelectFieldInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  children: React.ReactNode;
  fullWidth?: boolean;
} & Omit<SelectProps, 'name'>;

export function SelectFieldInput<T extends FieldValues>({
  name,
  control,
  label,
  children,
  fullWidth = true,
  ...selectProps
}: SelectFieldInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <FormControl fullWidth={fullWidth} error={!!error}>
          <InputLabel>{label}</InputLabel>
          <Select {...field} {...selectProps} label={label}>
            {children}
          </Select>
          {error && <FormHelperText>{error.message}</FormHelperText>}
        </FormControl>
      )}
    />
  );
}
