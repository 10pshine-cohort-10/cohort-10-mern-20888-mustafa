import type { Server } from 'node:http';
import { app } from './app';
import { connectDb, disconnectDb } from './config/db';
import { env } from './config/env';
import { logger } from './config/logger';

// how long running requests get to finish before their connections are cut
const SHUTDOWN_TIMEOUT_MS = 10_000;

let shuttingDown = false;

function shutdown(server: Server, signal: NodeJS.Signals): void {
  // a second signal while shutting down must not start a second shutdown
  if (shuttingDown) return;
  shuttingDown = true;
  logger.info({ signal }, 'Shutting down');

  // fallback: if requests do not finish in time, cut their connections so the process can end
  const forceTimer = setTimeout(() => {
    logger.error('Shutdown timed out, closing the remaining connections');
    process.exitCode = 1;
    server.closeAllConnections();
  }, SHUTDOWN_TIMEOUT_MS);
  forceTimer.unref();

  // a connection that was busy becomes idle once its response is sent, so close it then
  const sweep = setInterval(() => server.closeIdleConnections(), 250);
  sweep.unref();

  // stop accepting new connections; the callback runs when the last request has finished
  server.close((closeError) => {
    clearInterval(sweep);
    clearTimeout(forceTimer);
    if (closeError) {
      logger.error({ err: closeError }, 'Failed to close the server');
      process.exitCode = 1;
    }
    disconnectDb()
      .then(() => {
        logger.info('Shutdown complete');
      })
      .catch((err: unknown) => {
        logger.error({ err }, 'Failed to close the database connection');
        process.exitCode = 1;
      });
  });
}

async function start(): Promise<void> {
  try {
    await connectDb();
  } catch (err) {
    logger.error({ err }, 'Failed to connect to MongoDB');
    process.exitCode = 1;
    return;
  }

  const server = app.listen(env.PORT, (error) => {
    if (error) {
      logger.error({ err: error }, 'Failed to start listening');
      // set the exit code and close the database, so nothing keeps the process alive
      process.exitCode = 1;
      void disconnectDb();
      return;
    }
    logger.info({ port: env.PORT }, 'API listening');
    for (const signal of ['SIGINT', 'SIGTERM'] as const) {
      process.on(signal, () => shutdown(server, signal));
    }
  });
}

void start();
