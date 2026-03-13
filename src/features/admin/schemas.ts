import { z } from 'zod';
import type { TFunction } from 'i18next';

export const createClubSchema = (t: TFunction) =>
  z.object({
    name: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) }),
    registrationCode: z
      .string()
      .max(50, { message: t('validation.maxLength', { max: 50 }) })
      .optional()
      .or(z.literal('')),
    address: z
      .string()
      .max(500, { message: t('validation.maxLength', { max: 500 }) })
      .optional()
      .or(z.literal('')),
    contactEmail: z
      .string()
      .email({ message: t('validation.email') })
      .max(255, { message: t('validation.maxLength', { max: 255 }) })
      .optional()
      .or(z.literal('')),
    contactPhone: z
      .string()
      .max(50, { message: t('validation.maxLength', { max: 50 }) })
      .optional()
      .or(z.literal('')),
  });

export type CreateClubFormValues = z.infer<ReturnType<typeof createClubSchema>>;

export const adminCreateUserSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.email') }),
    password: z
      .string()
      .min(6, { message: t('validation.minLength', { min: 6 }) })
      .max(100, { message: t('validation.maxLength', { max: 100 }) }),
    firstName: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(100, { message: t('validation.maxLength', { max: 100 }) }),
    lastName: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(100, { message: t('validation.maxLength', { max: 100 }) }),
    dateOfBirth: z.string().min(1, { message: t('validation.required') }),
    phone: z
      .string()
      .min(1, { message: t('validation.required') })
      .max(50, { message: t('validation.maxLength', { max: 50 }) }),
  });

export type AdminCreateUserFormValues = z.infer<
  ReturnType<typeof adminCreateUserSchema>
>;
