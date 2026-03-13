import { z } from 'zod';
import type { TFunction } from 'i18next';

export const updateClubSchema = (t: TFunction) =>
  z.object({
    name: z.string().min(1, { message: t('validation.required') }).max(255),
    registrationCode: z.string().max(50).optional().or(z.literal('')),
    address: z.string().max(500).optional().or(z.literal('')),
    contactEmail: z
      .string()
      .email({ message: t('validation.email') })
      .max(255)
      .optional()
      .or(z.literal('')),
    contactPhone: z.string().max(50).optional().or(z.literal('')),
  });

export type UpdateClubFormValues = z.infer<ReturnType<typeof updateClubSchema>>;
