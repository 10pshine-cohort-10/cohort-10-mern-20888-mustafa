import { app } from './app';
import { env } from './config/env';
import { logger } from './config/logger';

app.listen(env.PORT, (error) => {
  if (error) {
    logger.error({ err: error }, 'Failed to start listening');
    // set the exit code and return, so the logger can finish writing before the process ends
    process.exitCode = 1;
    return;
  }
  logger.info({ port: env.PORT }, 'API listening');
});
