import { z } from 'zod';

import { USER_ROLES } from '@/api/user/types';

import { requiredText } from './text-fields';

export const USER_NAME_MAX = 255;
export const USER_PASSWORD_MIN = 6;
export const USER_PASSWORD_MAX = 128;

// Messages are i18n keys resolved by <FormMessage /> (namespace-prefixed)
const emailField = z
  .string()
  // Trim + lowercase BEFORE validating: the backend compares emails case-sensitively and
  // sign-up stores them lowercased, so every account email must use the same form
  .trim()
  .toLowerCase()
  .min(1, 'adminUser:emailRequired')
  .max(255, 'adminUser:emailTooLong')
  .email('adminUser:emailInvalid');

// Passwords are never trimmed or normalized
const passwordField = z
  .string()
  .min(USER_PASSWORD_MIN, 'adminUser:passwordMin')
  .max(USER_PASSWORD_MAX, 'adminUser:passwordMax');

const nameField = requiredText({ min: 0, max: USER_NAME_MAX, maxMessage: 'adminUser:nameTooLong' });

export const adminUserCreateSchema = z.object({
  email: emailField,
  name: nameField,
  role: z.enum(USER_ROLES),
  password: passwordField,
});

// Some existing accounts have no email: editing them must not force one (empty = leave unchanged)
export const adminUserUpdateSchema = adminUserCreateSchema
  .omit({ password: true })
  .extend({ email: emailField.or(z.literal('')) });

export const resetPasswordSchema = z.object({ newPassword: passwordField });

export type AdminUserCreateValues = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateValues = z.infer<typeof adminUserUpdateSchema>;
/** Form values shape shared by create and edit (password is ignored on edit) */
export type AdminUserFormValues = AdminUserUpdateValues & { password?: string };
