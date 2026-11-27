import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(0).max(65535).default(5001),
  CLIENT_ORIGIN: z.string().default('http://localhost:5174'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  MONGODB_URI: z.string().regex(/^mongodb(\+srv)?:\/\//, 'must be a MongoDB connection string'),
  JWT_SECRET: z.string().min(32, 'must be at least 32 characters'),
  RATE_LIMIT_WINDOW_MINUTES: z.coerce.number().int().min(1).max(1440).default(15),
  RATE_LIMIT_LOGIN_MAX: z.coerce.number().int().min(1).max(100000).default(10),
  RATE_LIMIT_SIGNUP_MAX: z.coerce.number().int().min(1).max(100000).default(5),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const problems = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`);
  console.error('Invalid environment variables:', problems);
  process.exit(1);
}

export const env = parsed.data;
