import { argon2id, hash } from 'argon2';
import { Router } from 'express';
import { User } from '../models/User';
import { signupSchema } from '../schemas/auth';
import { AppError } from '../utils/AppError';

export const authRouter = Router();

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
