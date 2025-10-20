import { Request, Response, NextFunction } from 'express';
import { ILogger } from '../libs/logging/logger.interface';
import { getRequestContext } from './requestContext';

/**
 * Request Logging Middleware Factory
 *
 * Creates middleware that logs the start and completion of HTTP requests.
 * Automatically captures request metadata, timing, and response status.
 *
 * Logs include:
 * - Incoming request (method, path, query params, user info)
 * - Request completion (status code, duration, user info)
 *
 * @param logger - Logger instance to use for logging
 * @returns Express middleware function
 */
export function createRequestLoggingMiddleware(logger: ILogger) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = getRequestContext();
    const startTime = Date.now();

    // Log incoming request
    logger.info('Incoming request', {
      method: req.method,
      path: req.path,
      query: Object.keys(req.query).length > 0 ? req.query : undefined,
      correlationId: context?.correlationId,
      userId: context?.userId,
      userName: context?.userName,
    });

    // Capture the original res.end function
    const originalEnd = res.end.bind(res);

    // Override res.end to log response when request completes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    res.end = function (this: Response, ...args: any[]): Response {
      const duration = Date.now() - startTime;

      // Determine log level based on status code
      const statusCode = res.statusCode;
      let logLevel: 'info' | 'warn' | 'error' = 'info';
      if (statusCode >= 500) {
        logLevel = 'error';
      } else if (statusCode >= 400) {
        logLevel = 'warn';
      }

      // Log request completion
      logger[logLevel]('Request completed', {
        method: req.method,
        path: req.path,
        statusCode,
        duration,
        correlationId: context?.correlationId,
        userId: context?.userId,
        userName: context?.userName,
      });

      // Call the original res.end function
      return originalEnd(...args);
    };

    next();
  };
}
