import { z } from 'zod';
import type { TFunction } from 'i18next';
import { ClubRole } from '@/types/common.types';

export const addUserToClubSchema = (t: TFunction) =>
  z.object({
    userId: z.string().min(1, { message: t('validation.required') }),
    role: z.nativeEnum(ClubRole, {
      errorMap: () => ({ message: t('validation.required') }),
    }),
  });

export type AddUserToClubFormValues = z.infer<ReturnType<typeof addUserToClubSchema>>;

export const updateUserSchema = (t: TFunction) =>
  z.object({
    firstName: z.string().min(1, { message: t('validation.required') }).max(100),
    lastName: z.string().min(1, { message: t('validation.required') }).max(100),
    phone: z.string().max(50).optional().or(z.literal('')),
    role: z.nativeEnum(ClubRole, {
      errorMap: () => ({ message: t('validation.required') }),
    }),
    active: z.boolean(),
  });

export type UpdateUserFormValues = z.infer<ReturnType<typeof updateUserSchema>>;
