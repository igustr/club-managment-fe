import { z } from 'zod';
import type { TFunction } from 'i18next';
import { SurfaceType } from '@/types/common.types';

export const pitchSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) }),
    address: z
      .string()
      .max(500, { message: t('validation.maxLength', { max: 500 }) })
      .optional()
      .or(z.literal('')),
    surfaceType: z
      .nativeEnum(SurfaceType)
      .optional()
      .or(z.literal('')),
    capacity: z
      .union([z.number().int().positive(), z.nan(), z.literal(0)])
      .optional()
      .transform((val) => (val && !isNaN(val) && val > 0 ? val : undefined)),
  });

export type PitchFormValues = z.infer<ReturnType<typeof pitchSchema>>;
