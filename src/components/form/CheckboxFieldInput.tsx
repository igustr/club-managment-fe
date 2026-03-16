import {
  Checkbox,
  FormControlLabel,
  FormHelperText,
  type CheckboxProps,
} from '@mui/material';
import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from 'react-hook-form';

type CheckboxFieldInputProps<T extends FieldValues> = {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
} & Omit<CheckboxProps, 'name' | 'checked' | 'onChange'>;

export function CheckboxFieldInput<T extends FieldValues>({
  name,
  control,
  label,
  ...checkboxProps
}: CheckboxFieldInputProps<T>) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <>
          <FormControlLabel
            control={
              <Checkbox
                {...checkboxProps}
                checked={!!field.value}
                onChange={field.onChange}
              />
            }
            label={label}
          />
          {error && (
            <FormHelperText error>{error.message}</FormHelperText>
          )}
        </>
      )}
    />
  );
}
