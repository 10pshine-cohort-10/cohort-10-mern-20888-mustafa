import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AppError } from '../utils/AppError';
import { COOKIE_NAME } from '../utils/token';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

// one message for every failure, so a caller learns nothing about why it was refused
const unauthorized = (): AppError => new AppError(401, 'Please log in to continue');

// only HS256 is accepted, so tokens signed with "none" or another algorithm are refused
const readUserId = (token: string): string | undefined => {
  try {
    const payload = jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] });
    if (typeof payload === 'string') return undefined;
    const { sub } = payload;
    return typeof sub === 'string' && /^[0-9a-f]{24}$/i.test(sub) ? sub : undefined;
  } catch {
    return undefined;
  }
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const cookies = req.cookies as Record<string, unknown> | undefined;
  const token = cookies?.[COOKIE_NAME];
  const userId = typeof token === 'string' ? readUserId(token) : undefined;
  if (!userId) throw unauthorized();

  // a token for a deleted account is refused too
  const user = await User.findById(userId);
  if (!user) throw unauthorized();

  const authUser: AuthUser = {
    id: user.id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
  res.locals.user = authUser;
  next();
};

export const getAuthUser = (res: Response): AuthUser => res.locals.user as AuthUser;
