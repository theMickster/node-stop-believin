import 'reflect-metadata';
import { Request, Response } from 'express';

import { getLoggerFromContext } from '@libs/logging/loggerAccessor';

import { getRequestContext } from '@middleware/requestContext';

/**
 * Logging Decorators for Express Controllers
 *
 * Provides declarative logging capabilities for controller methods using TypeScript decorators.
 * Separates cross-cutting concerns (logging, metrics) from business logic.
 */

// Metadata keys
export const CONTEXT_CAPTURE_KEY = Symbol('contextCapture');
export const LOG_OPERATION_KEY = Symbol('logOperation');

/**
 * Context Capture Configuration
 */
export interface ContextCaptureConfig {
  /** Name to use in log output (e.g., 'authorId') */
  name: string;
  /** Where to extract the value from */
  source: 'params' | 'query' | 'body' | 'user';
  /** Key to extract from the source (e.g., 'id' from req.params.id) */
  key: string;
}

/**
 * Log Operation Options
 */
export interface LogOperationOptions {
  /** Custom operation name (defaults to method name) */
  name?: string;
  /** Log when operation starts (default: true) */
  logStart?: boolean;
  /** Log when operation succeeds (default: true) */
  logSuccess?: boolean;
  /** Log when operation fails (default: true) */
  logError?: boolean;
  /** Include request body in logs (default: false, security concern) */
  includeBody?: boolean;
}

/**
 * @CaptureContext Decorator
 *
 * Captures context from Express request (params, query, body, user) for automatic logging.
 * Stores metadata that @LogOperation decorator will read at runtime.
 *
 * @param name - Name to use in logs (e.g., 'authorId')
 * @param source - Where to extract from: 'params', 'query', 'body', 'user'
 * @param key - Key to extract (defaults to name if not provided)
 *
 * @example
 * @Get('/:id')
 * @CaptureContext('authorId', 'params', 'id')
 * @LogOperation('GetAuthorById')
 * async getAuthorById(req: Request, res: Response) { }
 */
export function CaptureContext(
  name: string,
  source: 'params' | 'query' | 'body' | 'user',
  key?: string,
): MethodDecorator {
  return function (target: object, propertyKey: string | symbol) {
    const config: ContextCaptureConfig = {
      name,
      source,
      key: key || name,
    };

    // Append to existing captures
    const existing = (Reflect.getMetadata(CONTEXT_CAPTURE_KEY, target, propertyKey) as ContextCaptureConfig[]) || [];
    Reflect.defineMetadata(CONTEXT_CAPTURE_KEY, [...existing, config], target, propertyKey);
  };
}

/**
 * Helper: Extract captured context from request based on metadata
 */
function getCapturedContext(target: object, propertyKey: string | symbol, req: Request): Record<string, unknown> {
  const configs = Reflect.getMetadata(CONTEXT_CAPTURE_KEY, target, propertyKey) as ContextCaptureConfig[] | undefined;
  if (!configs || configs.length === 0) return {};

  const context: Record<string, unknown> = {};

  for (const config of configs) {
    let value: unknown;

    switch (config.source) {
      case 'params':
        value = req.params[config.key];
        break;
      case 'query':
        value = req.query[config.key];
        break;
      case 'body':
        value = (req.body as Record<string, unknown>)?.[config.key];
        break;
      case 'user':
        value = (req.user as Record<string, unknown>)?.[config.key];
        break;
    }

    if (value !== undefined) {
      context[config.name] = value;
    }
  }

  return context;
}

/**
 * @Observe Decorator (Composite)
 *
 * Convenience decorator that combines @LogOperation with smart defaults.
 * Equivalent to @LogOperation but with a shorter name.
 *
 * @param operationName - Operation name (defaults to method name if not provided)
 *
 */
export function Observe(operationName?: string): MethodDecorator {
  return LogOperation(operationName ? { name: operationName } : {});
}

/**
 * @LogOperation Decorator
 *
 * Automatically logs operation start, completion, and errors with timing and context.
 * Integrates with request context, captured context, and CQRS result patterns.
 *
 * Features:
 * - Automatic operation start/success/error logging
 * - Duration tracking
 * - Integration with AsyncLocalStorage request context
 * - CQRS QueryResult/CommandResult pattern detection
 * - Response status code detection
 * - Exception handling
 *
 * @param options - Operation name or configuration options
 *
 */
export function LogOperation(options?: string | LogOperationOptions): MethodDecorator {
  return function (target: object, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value as (...args: unknown[]) => Promise<unknown>;

    // Parse options
    const opts: LogOperationOptions = typeof options === 'string' ? { name: options } : options || {};
    const operationName = opts.name || String(propertyKey);
    const logStart = opts.logStart !== false;
    const logSuccess = opts.logSuccess !== false;
    const logError = opts.logError !== false;

    descriptor.value = async function (this: unknown, req: Request, res: Response, ...rest: unknown[]) {
      const logger = getLoggerFromContext(this);
      const startTime = Date.now();

      // Extract context
      const requestContext = getRequestContext(req);
      const capturedContext = getCapturedContext(target, propertyKey, req);

      const baseMetadata = {
        operation: operationName,
        correlationId: requestContext?.correlationId,
        userId: requestContext?.userId,
        userName: requestContext?.userName,
        ...capturedContext,
      };

      // Track response status
      let statusCode = 200;
      let responseLogged = false;

      // Intercept res.status to capture status code
      const originalStatus = res.status.bind(res);
      res.status = function (code: number) {
        statusCode = code;
        return originalStatus(code);
      };

      // Intercept res.json to log on completion
      const originalJson = res.json.bind(res);
      res.json = function (body: unknown) {
        if (!responseLogged) {
          responseLogged = true;
          const duration = Date.now() - startTime;

          if (statusCode >= 500) {
            logger.error('Operation failed', {
              ...baseMetadata,
              statusCode,
              duration,
            });
          } else if (statusCode >= 400) {
            logger.warn('Operation completed with client error', {
              ...baseMetadata,
              statusCode,
              duration,
            });
          } else if (logSuccess) {
            logger.info('Operation completed successfully', {
              ...baseMetadata,
              statusCode,
              duration,
            });
          }
        }

        return originalJson(body);
      };

      // Log start
      if (logStart) {
        logger.info('Starting operation', baseMetadata);
      }

      try {
        // Execute original method
        const result = await originalMethod.apply(this, [req, res, ...rest]);

        // Check for CQRS result patterns (type-safe checks)
        if (result && typeof result === 'object' && 'success' in result && result.success === false) {
          if (logError && 'error' in result) {
            const errorResult = result as {
              success: false;
              error: { code: string; message: string; statusCode: number };
            };
            logger.error('Operation failed (CQRS)', {
              ...baseMetadata,
              code: errorResult.error.code,
              message: errorResult.error.message,
              statusCode: errorResult.error.statusCode,
              duration: Date.now() - startTime,
            });
          }
        } else if (!responseLogged && logSuccess) {
          logger.info('Operation completed', {
            ...baseMetadata,
            duration: Date.now() - startTime,
          });
        }

        return result;
      } catch (error) {
        if (logError) {
          logger.error('Operation threw exception', {
            ...baseMetadata,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
            duration: Date.now() - startTime,
          });
        }
        throw error;
      }
    };

    return descriptor;
  };
}
