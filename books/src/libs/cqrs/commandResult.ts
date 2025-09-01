/**
 * Detailed error information for failed operations
 */
export interface ErrorDetail {
  code: string; // Error code for programmatic handling (e.g., 'BOOK_NOT_FOUND', 'INVALID_ISBN')
  message: string; // Human-readable error message
  field?: string; // Field name for validation errors
  statusCode: number; // HTTP status code to return
}

/**
 * Result type for command operations
 * Returns either success with data or failure with error details
 */
export type CommandResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorDetail };

/**
 * Creates a successful command result
 */
export function commandOk<T>(data: T): CommandResult<T> {
  return { success: true, data };
}

/**
 * Creates a failed command result with detailed error information
 */
export function commandFail<T>(
  code: string,
  message: string,
  statusCode: number = 500,
  field?: string
): CommandResult<T> {
  return {
    success: false,
    error: {
      code,
      message,
      statusCode,
      ...(field ? { field } : {}),
    },
  };
}

/**
 * Type guard for successful command results
 */
export function isCommandOk<T>(result: CommandResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard for failed command results
 */
export function isCommandFail<T>(result: CommandResult<T>): result is { success: false; error: ErrorDetail } {
  return result.success === false;
}
