import { app } from './app';
import { connectDb, disconnectDb } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

async function start(): Promise<void> {
  try {
    await connectDb();
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    process.exitCode = 1;
    return;
  }

  app.listen(env.PORT, (error) => {
    if (error) {
      logger.error({ err: error }, 'Failed to start listening');
      // set the exit code and close the database, so nothing keeps the process alive
      process.exitCode = 1;
      void disconnectDb();
      return;
    }
    logger.info({ port: env.PORT }, 'API listening');
  });
}

void start();
