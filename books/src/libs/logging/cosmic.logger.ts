import { inject, injectable } from 'inversify';
import { ILogger } from './logger.interface';
import TYPES from '../ioc.types';

/**
 * Cosmic Logger
 *
 * A decorator logger that wraps the WinstonLogger.
 * This provides a layer of indirection for future enhancements or logger swapping.
 * Currently delegates all operations directly to the WinstonLogger.
 */
@injectable()
export class CosmicLogger implements ILogger {
  constructor(@inject(TYPES.WinstonLogger) private readonly winstonLogger: ILogger) {}

  info(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.info(message, meta);
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.warn(message, meta);
  }

  error(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.error(message, meta);
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    this.winstonLogger.debug(message, meta);
  }

  /**
   * Creates a child logger with additional context
   *
   * Delegates to the underlying WinstonLogger's child() method.
   *
   * @param context - Additional context to include in all logs from the child logger
   * @returns A new ILogger instance with the additional context
   */
  child(context: Record<string, unknown>): ILogger {
    return this.winstonLogger.child(context);
  }
}
