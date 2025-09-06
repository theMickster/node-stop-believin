import path from 'path';

import { OpenTelemetryTransportV3 } from '@opentelemetry/winston-transport';
import { injectable, unmanaged } from 'inversify';
import winston from 'winston';

import config from '../../config/config';
import { RequestContext } from '../../middleware/requestContext';

import { ILogger } from './logger.interface';

/**
 * Contextual Winston Logger
 *
 * A Winston-based logger implementation that automatically enriches log entries with:
 * - Static application metadata (name, version, environment)
 * - Request context (correlation ID, request ID, HTTP metadata)
 * - User context (user ID, name, email, roles, scopes from JWT)
 * - Child logger context (component-specific metadata)
 *
 * This logger integrates with:
 * - Azure Application Insights via OpenTelemetry
 * - Console output (development only)
 * - File output (development only)
 */
@injectable()
export class ContextualWinstonLogger implements ILogger {
  private readonly logger: winston.Logger;
  private readonly staticProps: Record<string, string>;
  private readonly childContext: Record<string, unknown> | undefined;

  /**
   * Creates a new ContextualWinstonLogger instance
   *
   * @param childContext - Optional context to include in all log entries from this logger instance
   */
  constructor(@unmanaged() childContext?: Record<string, unknown>) {
    this.childContext = childContext ?? undefined;
    this.staticProps = {
      ApplicationName: config.applicationName,
      ApplicationVersion: config.applicationVersion,
      Environment: config.nodeEnv.toUpperCase(),
    };

    const transports: winston.transport[] = [];

    // Development-only transports for local debugging
    if (config.nodeEnv === 'development') {
      // Console transport with colored, human-readable format
      transports.push(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, correlationId, userId, userName, operation, ...rest }) => {
              const correlation = correlationId ? `[${correlationId as string}]` : '';
              const user = userName ? `[${userName as string}]` : userId ? `[User:${userId as string}]` : '';
              const op = operation ? `[${operation as string}]` : '';
              const meta = Object.keys(rest).length > 0 ? `\n${JSON.stringify(rest, null, 2)}` : '';
              return `${level} ${correlation}${user}${op}: ${message}${meta}`;
            })
          ),
        })
      );

      // File transport with JSON format for structured logging
      transports.push(
        new winston.transports.File({
          filename: path.join(process.cwd(), 'logs', 'app.log'),
          level: config.logLevel,
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        })
      );
    }

    // OpenTelemetry transport for Application Insights
    // This is always enabled regardless of environment
    transports.push(new OpenTelemetryTransportV3({ format: winston.format.json() }));

    this.logger = winston.createLogger({
      level: config.logLevel,
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
      transports: transports,
    });
  }

  /**
   * Enriches log metadata with all available context
   *
   * Context is applied in the following order (later overrides earlier):
   * 1. Static application properties (name, version, environment)
   * 2. Child logger context (if this is a child logger)
   * 3. Request context from AsyncLocalStorage (correlation ID, user info, etc.)
   * 4. User-provided metadata (highest priority)
   *
   * @param meta - User-provided metadata
   * @returns Enriched metadata object
   */
  private enrichMetadata(meta?: Record<string, unknown>): Record<string, unknown> {
    // Note: Without AsyncLocalStorage, we can't automatically get the context here.
    // The context should be explicitly passed in the metadata when logging.
    // This is a trade-off for avoiding the experimental async_hooks API.
    const context = meta?.executionContext as RequestContext | undefined;

    return {
      // 1. Static application properties
      ...this.staticProps,

      // 2. Child logger context
      ...this.childContext,

      // 3. Request context (if available)
      ...(context && {
        correlationId: context.correlationId,
        requestId: context.requestId,
        method: context.method,
        path: context.path,
        userId: context.userId,
        userName: context.userName,
        userEmail: context.userEmail,
        tenantId: context.tenantId,
        roles: context.roles,
        scopes: context.scopes,
        clientIp: context.clientIp,
        userAgent: context.userAgent,
      }),

      // 4. User-provided metadata (highest priority)
      ...meta,
    };
  }

  info(message: string, meta?: Record<string, unknown>): void {
    this.logger.info(message, this.enrichMetadata(meta));
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.logger.warn(message, this.enrichMetadata(meta));
  }

  error(message: string, meta?: Record<string, unknown>): void {
    const enrichedMeta = this.enrichMetadata(meta);
    const errorObject = meta && meta.error instanceof Error ? meta.error : new Error(message);
    this.logger.error(message, { ...enrichedMeta, error: errorObject });
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.logger.debug(message, this.enrichMetadata(meta));
  }

  /**
   * Creates a child logger with additional context
   *
   * Child loggers inherit all context from their parent and add new context.
   * This is useful for creating component-specific or operation-specific loggers.
   *
   * @param context - Additional context to include in all logs from the child logger
   * @returns A new ContextualWinstonLogger instance with the combined context
   */
  child(context: Record<string, unknown>): ILogger {
    return new ContextualWinstonLogger({
      ...this.childContext,
      ...context,
    });
  }
}
