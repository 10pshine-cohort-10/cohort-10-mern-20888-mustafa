import { z } from 'zod';

export const signupSchema = z
  .strictObject({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be 3 to 30 characters')
      .max(30, 'Username must be 3 to 30 characters')
      .regex(/^[A-Za-z0-9_]+$/, 'Username can only use letters, numbers and underscores'),
    email: z.string().trim().toLowerCase().pipe(z.email('Enter a valid email address')),
    password: z
      .string()
      .min(10, 'Password must be at least 10 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(/[a-z]/, 'Password needs a lowercase letter')
      .regex(/[A-Z]/, 'Password needs an uppercase letter')
      .regex(/[0-9]/, 'Password needs a number')
      .regex(/[^A-Za-z0-9]/, 'Password needs a symbol'),
  })
  .superRefine((data, ctx) => {
    const password = data.password.toLowerCase();
    const emailName = data.email.split('@')[0] ?? '';
    if (password.includes(data.username.toLowerCase())) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password must not contain your username',
      });
    }
    if (emailName.length >= 3 && password.includes(emailName)) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password must not contain your email name',
      });
    }
  });

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1).max(128),
});
