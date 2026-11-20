import pinoHttp from 'pino-http';
import { logger } from '../config/logger';

export const httpLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url.split('?')[0] }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
});
