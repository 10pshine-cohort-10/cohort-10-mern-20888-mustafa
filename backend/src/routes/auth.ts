import { argon2id, hash, verify } from 'argon2';
import { Router } from 'express';
import { logger } from '../config/logger';
import { User } from '../models/User';
import { loginSchema, signupSchema } from '../schemas/auth';
import { AppError } from '../utils/AppError';
import { COOKIE_NAME, cookieOptions, signToken } from '../utils/token';

export const authRouter = Router();

// a real hash to compare against when the email is unknown, so both cases take about the same time
let dummyHash: Promise<string> | undefined;
const getDummyHash = (): Promise<string> =>
  (dummyHash ??= hash('timing-dummy-password', { type: argon2id }));

authRouter.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = [...new Set(parsed.error.issues.map((issue) => issue.message))].join('. ');
    throw new AppError(400, message);
  }

  const { username, email, password } = parsed.data;
  const passwordHash = await hash(password, { type: argon2id });

  try {
    const user = await User.create({ username, email, passwordHash });
    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    if ((error as { code?: number }).code === 11000) {
      throw new AppError(409, 'An account with that email or username already exists');
    }
    throw error;
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, 'Enter your email and password');
  }

  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+passwordHash');

  let passwordMatches = false;
  try {
    passwordMatches = await verify(user ? user.passwordHash : await getDummyHash(), password);
  } catch (error) {
    // a damaged stored hash counts as a failed login, it must not crash or reveal anything
    logger.error({ err: error }, 'Password check failed');
  }

  if (!user || !passwordMatches) {
    throw new AppError(401, 'Invalid email or password');
  }

  res.cookie(COOKIE_NAME, signToken(user.id), cookieOptions);
  res.status(200).json({
    status: 'success',
    data: {
      user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
    },
  });
});
