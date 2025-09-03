/**
 * Logger Interface
 *
 * Provides structured logging capabilities with support for contextual child loggers.
 */
export interface ILogger {
  /**
   * Log informational message
   * @param message - Log message
   * @param meta - Optional metadata to include in log entry
   */
  info(message: string, meta?: Record<string, unknown>): void;

  /**
   * Log warning message
   * @param message - Log message
   * @param meta - Optional metadata to include in log entry
   */
  warn(message: string, meta?: Record<string, unknown>): void;

  /**
   * Log error message
   * @param message - Log message
   * @param meta - Optional metadata to include in log entry (should include error object if available)
   */
  error(message: string, meta?: Record<string, unknown>): void;

  /**
   * Log debug message
   * @param message - Log message
   * @param meta - Optional metadata to include in log entry
   */
  debug(message: string, meta?: Record<string, unknown>): void;

  /**
   * Create a child logger with additional context
   *
   * Child loggers inherit all context from their parent and add additional context.
   * This is useful for adding component-specific or operation-specific context
   * without having to pass metadata with every log call.
   *
   * Example:
   * ```typescript
   * const controllerLogger = logger.child({ controller: 'AuthorController' });
   * const opLogger = controllerLogger.child({ operation: 'CreateAuthor' });
   * opLogger.info('Creating author'); // Will include controller and operation in metadata
   * ```
   *
   * @param context - Additional context to include in all logs from this child logger
   * @returns A new ILogger instance with the additional context
   */
  child(context: Record<string, unknown>): ILogger;
}
