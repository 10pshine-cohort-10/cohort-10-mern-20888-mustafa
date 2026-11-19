import { STATUS_CODES } from 'node:http';
import type { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { AppError } from '../utils/AppError';

// Errors from Express and body-parser (bad JSON, body too large) carry a numeric status.
const getClientErrorStatus = (error: unknown): number | undefined => {
  if (typeof error !== 'object' || error === null) return undefined;
  const status = (error as { status?: unknown }).status;
  return typeof status === 'number' && status >= 400 && status < 500 ? status : undefined;
};

export const errorHandler = (
  error: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (res.headersSent) {
    _next(error);
    return;
  }

  let statusCode = 500;
  let message = 'Something went wrong';

  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else {
    const clientStatus = getClientErrorStatus(error);
    if (clientStatus !== undefined) {
      statusCode = clientStatus;
      message = STATUS_CODES[clientStatus] ?? 'Bad Request';
    }
  }

  if (statusCode >= 500) {
    logger.error({ err: error, method: req.method, url: req.originalUrl }, 'Request failed');
  } else {
    logger.warn({ statusCode, method: req.method, url: req.originalUrl }, message);
  }

  res.status(statusCode).json({ status: 'error', message });
};
