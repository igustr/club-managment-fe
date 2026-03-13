import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, TextField, IconButton } from '@mui/material';
import { Send } from '@mui/icons-material';
import { sendMessageSchema, type SendMessageFormValues } from '../schemas';

interface SendMessageFormProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function SendMessageForm({ onSend, disabled }: SendMessageFormProps) {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<SendMessageFormValues>({
    resolver: zodResolver(sendMessageSchema(t)),
    defaultValues: { text: '' },
  });

  const onSubmit = (data: SendMessageFormValues) => {
    onSend(data.text);
    reset();
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <TextField
        {...register('text')}
        placeholder={t('chat.messagePlaceholder')}
        size="small"
        fullWidth
        multiline
        maxRows={4}
        disabled={disabled}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(onSubmit)();
          }
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        disabled={disabled || !isValid}
      >
        <Send />
      </IconButton>
    </Box>
  );
}
