import { z } from 'zod';
import type { TFunction } from 'i18next';

export const trainingSchema = (t: TFunction) =>
  z.object({
    teamId: z.string().min(1, { message: t('validation.required') }),
    date: z.string().min(1, { message: t('validation.required') }),
    startTime: z.string().min(1, { message: t('validation.required') }),
    endTime: z.string().min(1, { message: t('validation.required') }),
    pitchId: z.string().optional().or(z.literal('')),
    notes: z
      .string()
      .max(1000, { message: t('validation.maxLength', { max: 1000 }) })
      .optional()
      .or(z.literal('')),
  });

export type TrainingFormValues = z.infer<ReturnType<typeof trainingSchema>>;

export const recurringTrainingSchema = (t: TFunction) =>
  z.object({
    teamId: z.string().min(1, { message: t('validation.required') }),
    startDate: z.string().min(1, { message: t('validation.required') }),
    endDate: z.string().min(1, { message: t('validation.required') }),
    dayOfWeek: z.string().min(1, { message: t('validation.required') }),
    startTime: z.string().min(1, { message: t('validation.required') }),
    endTime: z.string().min(1, { message: t('validation.required') }),
    pitchId: z.string().optional().or(z.literal('')),
    notes: z
      .string()
      .max(1000, { message: t('validation.maxLength', { max: 1000 }) })
      .optional()
      .or(z.literal('')),
  });

export type RecurringTrainingFormValues = z.infer<
  ReturnType<typeof recurringTrainingSchema>
>;
