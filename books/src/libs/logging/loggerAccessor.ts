import { ILogger } from './logger.interface';

/**
 * Logger Accessor
 *
 * Provides access to the global logger instance for use in decorators and other
 * contexts where dependency injection is not available.
 *
 * The accessor supports a hybrid approach:
 * 1. Try to get logger from controller instance (this.logger)
 * 2. Fallback to global logger instance
 */

let globalLogger: ILogger | undefined;

/**
 * Set the global logger instance
 * Should be called once during application initialization
 */
export function setGlobalLogger(logger: ILogger): void {
  globalLogger = logger;
}

/**
 * Get the global logger instance
 * @throws Error if logger has not been initialized
 */
export function getGlobalLogger(): ILogger {
  if (!globalLogger) {
    throw new Error('Global logger not initialized. Call setGlobalLogger() during application startup.');
  }
  return globalLogger;
}

/**
 * Get logger from context (hybrid approach)
 *
 * Attempts to retrieve logger from:
 * 1. Controller instance property (this.logger)
 * 2. Global logger instance
 *
 * @param context - The 'this' context from the method call
 * @returns ILogger instance
 */
export function getLoggerFromContext(context: unknown): ILogger {
  // Try to get from instance property
  if (context && typeof context === 'object' && 'logger' in context) {
    const logger = (context as { logger: unknown }).logger;
    if (logger && typeof logger === 'object') {
      return logger as ILogger;
    }
  }

  // Fallback to global logger
  return getGlobalLogger();
}
