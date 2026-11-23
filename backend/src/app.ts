import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_ORIGIN }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});
