import type { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export const COOKIE_NAME = 'cohort_token';
export const TOKEN_MAX_AGE_MS = 60 * 60 * 1000;

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  maxAge: TOKEN_MAX_AGE_MS,
};

export function signToken(userId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    algorithm: 'HS256',
    subject: userId,
    expiresIn: TOKEN_MAX_AGE_MS / 1000,
  });
}
