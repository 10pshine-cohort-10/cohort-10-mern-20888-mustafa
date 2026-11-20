import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

app.listen(env.PORT, (error) => {
  if (error) {
    logger.error({ err: error }, 'Failed to start listening');
    process.exit(1);
  }
  logger.info({ port: env.PORT }, 'API listening');
});
