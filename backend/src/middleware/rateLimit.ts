import type { NextFunction, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';

const windowMs = env.RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

// the 429 goes through the normal error handler, so it has the same JSON shape as other errors
const tooManyAttempts = (_req: Request, _res: Response, next: NextFunction): void => {
  next(new AppError(429, 'Too many attempts. Please wait a while and try again.'));
};

export const loginLimiter = rateLimit({
  windowMs,
  limit: env.RATE_LIMIT_LOGIN_MAX,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  // only failed logins count, so a real user is not locked out by their own good logins
  skipSuccessfulRequests: true,
  handler: tooManyAttempts,
});

// every signup attempt counts, because each one costs an argon2 hash and may create an account
export const signupLimiter = rateLimit({
  windowMs,
  limit: env.RATE_LIMIT_SIGNUP_MAX,
  standardHeaders: 'draft-6',
  legacyHeaders: false,
  handler: tooManyAttempts,
});
