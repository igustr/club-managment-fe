import { z } from 'zod';
import type { TFunction } from 'i18next';
import { VenueType } from '@/types/common.types';

export const gameSchema = (t: TFunction) =>
  z.object({
    teamId: z.string().min(1, { message: t('validation.required') }),
    date: z.string().min(1, { message: t('validation.required') }),
    startTime: z.string().min(1, { message: t('validation.required') }),
    endTime: z.string().min(1, { message: t('validation.required') }),
    opponent: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) }),
    venueType: z.nativeEnum(VenueType),
    pitchId: z.string().optional().or(z.literal('')),
    venueName: z
      .string()
      .max(255, { message: t('validation.maxLength', { max: 255 }) })
      .optional()
      .or(z.literal('')),
    venueAddress: z
      .string()
      .max(500, { message: t('validation.maxLength', { max: 500 }) })
      .optional()
      .or(z.literal('')),
    notes: z
      .string()
      .max(1000, { message: t('validation.maxLength', { max: 1000 }) })
      .optional()
      .or(z.literal('')),
  });

export type GameFormValues = z.infer<ReturnType<typeof gameSchema>>;
