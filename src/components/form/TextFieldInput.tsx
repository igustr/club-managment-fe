import { TextField, type TextFieldProps } from '@mui/material';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type TextFieldInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
} & Omit<TextFieldProps, 'name'>;

export function TextFieldInput<T extends FieldValues>({
  name,
  control,
  ...textFieldProps
}: TextFieldInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          {...textFieldProps}
          error={!!error}
          helperText={error?.message ?? textFieldProps.helperText}
        />
      )}
    />
  );
}
