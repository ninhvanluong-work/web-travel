import * as z from 'zod';

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .max(255)
    .email('Please enter a valid email address')
    .transform((v) => v.trim()),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().default(false).optional(),
});

export type AdminLoginSchema = z.infer<typeof adminLoginSchema>;
