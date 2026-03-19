import { z } from 'zod';
import type { TFunction } from 'i18next';

export const tournamentSchema = (t: TFunction) =>
  z.object({
    teamId: z.string().min(1, { message: t('validation.required') }),
    name: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) }),
    startDate: z.string().min(1, { message: t('validation.required') }),
    endDate: z.string().min(1, { message: t('validation.required') }),
    notes: z
      .string()
      .max(1000, { message: t('validation.maxLength', { max: 1000 }) })
      .optional()
      .or(z.literal('')),
  });

export type TournamentFormValues = z.infer<
  ReturnType<typeof tournamentSchema>
>;
