import { createRequire } from 'node:module';
import pino from 'pino';
import { env } from './env';

// pino-pretty is a dev dependency, so use it only when it is installed; without it, log plain JSON
const canPrettyPrint = (): boolean => {
  try {
    createRequire(__filename).resolve('pino-pretty');
    return true;
  } catch {
    return false;
  }
};
const usePretty = env.NODE_ENV === 'development' && canPrettyPrint();

export const logger = pino({
  level: env.LOG_LEVEL,
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
    censor: '[redacted]',
  },
  ...(usePretty ? { transport: { target: 'pino-pretty' } } : {}),
});
