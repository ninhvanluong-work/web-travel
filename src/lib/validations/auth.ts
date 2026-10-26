import * as z from 'zod';

import { REGEX_PASSWORD } from '../regex';
import { validationMessages } from './validation.utility';

export const authSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z
    .string()
    .min(8, {
      message: 'Password must be at least 8 characters long',
    })
    .max(100)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})/, {
      message:
        'Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special character',
    }),
});

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .min(6, {
      message: 'Verification code must be 6 characters long',
    })
    .max(6),
});

export const checkEmailSchema = z.object({
  email: authSchema.shape.email,
});

export const resetPasswordSchema = z
  .object({
    password: authSchema.shape.password,
    confirmPassword: authSchema.shape.password,
    code: verifyEmailSchema.shape.code,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const registerSchema = z
  .object({
    firstName: z.string().nonempty(validationMessages.required('First name')),
    lastName: z.string().nonempty(validationMessages.required('Last name')),
    email: z.string().nonempty(validationMessages.required('Email')).email(validationMessages.invalid('Email')),
    company: z.string().nonempty(validationMessages.required('Company code')),
    password: z
      .string()
      .nonempty(validationMessages.required('Password'))
      .min(8, validationMessages.gt(8, 'Password'))
      .max(20, validationMessages.lt(20, 'Password'))
      .refine((v) => REGEX_PASSWORD.test(v), 'Password too weak'),
    confirmPassword: z.string().nonempty(validationMessages.required('Confirm password')),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  email: z
    .string()
    // Trim + lowercase BEFORE validating: sign-up stores lowercase and the backend compares case-sensitively
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(255)
    .email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false).optional(),
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .nonempty(validationMessages.required('Email'))
    .email(validationMessages.invalid('Email')),
});

export const resetPassSchema = z.object({
  newPassword: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100)
    .refine(
      (v) => REGEX_PASSWORD.test(v),
      'Password must contain at least 1 uppercase, 1 lowercase, and 1 number or special character'
    ),
});

export const profileSchema = z.object({
  firstName: z.string().nonempty(validationMessages.required('First name')),
  lastName: z.string().nonempty(validationMessages.required('Last name')),
  email: z.string().nonempty(validationMessages.required('Email')).email(validationMessages.invalid('Email')),
  company: z.string().nonempty(validationMessages.required('Company code')),
});

// Messages are `common` i18n keys (FormMessage translates them). Passwords are never trimmed.
// The new password follows the BE rule only (min 6), same as the admin user forms; the old one is
// only checked by the BE.
export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'changePassword.oldRequired'),
    newPassword: z.string().min(6, 'changePassword.newMin').max(100, 'changePassword.newMax'),
    confirmPassword: z.string().min(1, 'changePassword.confirmRequired'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'changePassword.mismatch',
    path: ['confirmPassword'],
  })
  .refine((data) => !data.oldPassword || data.newPassword !== data.oldPassword, {
    message: 'changePassword.sameAsOld',
    path: ['newPassword'],
  });

export const signUpSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Email is required')
    .max(255)
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(100)
    .refine(
      (v) => REGEX_PASSWORD.test(v),
      'Password must contain at least 1 uppercase, 1 lowercase, and 1 number or special character'
    ),
  isTourGuide: z.boolean().default(false),
});

export type LoginSchema = z.infer<typeof loginSchema>;
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type RegisterSchema = z.infer<typeof registerSchema>;
export type ForgotSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetSchema = z.infer<typeof resetPassSchema>;
export type ProfileSchema = z.infer<typeof profileSchema>;
export type ChangePasswordSchema = z.infer<typeof changePasswordSchema>;
