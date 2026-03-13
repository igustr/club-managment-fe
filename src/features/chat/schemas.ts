import { z } from 'zod';
import type { TFunction } from 'i18next';

export const sendMessageSchema = (t: TFunction) =>
  z.object({
    text: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(5000, { message: t('validation.maxLength', { max: 5000 }) }),
  });

export type SendMessageFormValues = z.infer<ReturnType<typeof sendMessageSchema>>;
