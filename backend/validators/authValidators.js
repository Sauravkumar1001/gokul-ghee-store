import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(100),
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  phone: z
    .string()
    .trim()
    .min(10, 'Please provide a valid phone number.')
    .max(20),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters.')
    .max(128),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Please provide a valid email address.').toLowerCase(),
  password: z.string().min(1, 'Password is required.'),
  captchaToken: z.string().optional(),
  captchaAnswer: z.string().optional(),
});
