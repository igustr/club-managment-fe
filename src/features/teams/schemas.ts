import { z } from 'zod';
import type { TFunction } from 'i18next';

export const teamSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) }),
    ageGroup: z
      .string()
      .max(50, { message: t('validation.maxLength', { max: 50 }) })
      .optional()
      .or(z.literal('')),
    season: z
      .string()
      .max(20, { message: t('validation.maxLength', { max: 20 }) })
      .optional()
      .or(z.literal('')),
  });

export type TeamFormValues = z.infer<ReturnType<typeof teamSchema>>;
