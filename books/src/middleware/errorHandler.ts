import { Request, Response, NextFunction } from 'express';

import container from '../libs/ioc.container';
import TYPES from '../libs/ioc.types';
import { ILogger } from '../libs/logging/logger.interface';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const logger = container.get<ILogger>(TYPES.Logger);
  const statusCode = err.status ?? 500;

  // Log error with structured context
  logger.error('Unhandled error in request', {
    error: err.message,
    stack: err.stack,
    statusCode,
    path: req.path,
    method: req.method,
    correlationId: req.headers['x-correlation-id'] || 'unknown',
  });

  const errorResponse: { status: number; message: string; stack?: string } = {
    status: statusCode,
    message: err.message || 'Internal Server Error',
  };

  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack ?? '';
  }

  res.status(statusCode).json(errorResponse);
};
