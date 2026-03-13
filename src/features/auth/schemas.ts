import { z } from 'zod';
import type { TFunction } from 'i18next';

export const loginSchema = (t: TFunction) =>
  z.object({
    email: z
      .string()
      .min(1, { message: t('validation.required') })
      .email({ message: t('validation.email') }),
    password: z.string().min(1, { message: t('validation.required') }),
  });

export type LoginFormValues = z.infer<ReturnType<typeof loginSchema>>;

export const registerSchema = (t: TFunction) =>
  z
    .object({
      firstName: z.string().min(1, { message: t('validation.required') }),
      lastName: z.string().min(1, { message: t('validation.required') }),
      email: z
        .string()
        .min(1, { message: t('validation.required') })
        .email({ message: t('validation.email') }),
      dateOfBirth: z.string().min(1, { message: t('validation.required') }),
      phone: z.string().min(1, { message: t('validation.required') }),
      password: z
        .string()
        .min(8, { message: t('validation.minLength', { min: 8 }) }),
      confirmPassword: z
        .string()
        .min(1, { message: t('validation.required') }),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordMismatch'),
      path: ['confirmPassword'],
    });

export type RegisterFormValues = z.infer<ReturnType<typeof registerSchema>>;
