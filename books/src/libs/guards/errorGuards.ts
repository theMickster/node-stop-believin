/**
 * Type guards for error handling
 *
 * Provides type-safe utilities for working with unknown error types in catch blocks.
 * Use these guards to safely access error properties without risking runtime errors.
 */

/**
 * Type guard to check if an error is a standard Error object with a message property
 *
 * @param error - The unknown error to check
 * @returns true if error has a message property of type string
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (err: unknown) {
 *   if (isErrorWithMessage(err)) {
 *     console.log(err.message); // Type-safe access to message
 *   }
 * }
 * ```
 */
export function isErrorWithMessage(error: unknown): error is Error {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

/**
 * Type guard to check if an error has a numeric code property
 * Commonly used for database errors (like Cosmos DB) or system errors
 *
 * @param error - The unknown error to check
 * @returns true if error has a code property of type number
 *
 * @example
 * ```typescript
 * try {
 *   await cosmosContainer.item(id).read();
 * } catch (err: unknown) {
 *   if (isErrorWithCode(err) && err.code === 404) {
 *     console.log('Item not found');
 *   }
 * }
 * ```
 */
export function isErrorWithCode(error: unknown): error is { code: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'number'
  );
}

/**
 * Type guard to check if an error has a numeric status property
 * Commonly used for HTTP errors from axios, fetch, or similar libraries
 *
 * @param error - The unknown error to check
 * @returns true if error has a status property of type number
 *
 * @example
 * ```typescript
 * try {
 *   await fetch('/api/data');
 * } catch (err: unknown) {
 *   if (isErrorWithStatus(err) && err.status === 401) {
 *     console.log('Unauthorized');
 *   }
 * }
 * ```
 */
export function isErrorWithStatus(error: unknown): error is { status: number } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    typeof (error as Record<string, unknown>).status === 'number'
  );
}

/**
 * Safely extracts an error message from any error type
 * Always returns a string, never throws
 *
 * @param error - The unknown error to extract a message from
 * @returns A string error message. Returns 'Unknown error' if no message can be extracted
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (err: unknown) {
 *   const message = getErrorMessage(err); // Always safe, always returns string
 *   logger.error(message);
 * }
 * ```
 */
export function getErrorMessage(error: unknown): string {
  if (isErrorWithMessage(error)) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  try {
    const stringified = JSON.stringify(error);
    return stringified ?? 'Unknown error';
  } catch {
    return 'Unknown error';
  }
}

/**
 * Converts any error type to a standardized error object
 * Useful for logging or API responses
 *
 * @param error - The unknown error to convert
 * @returns An object with message and optional stack properties
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (err: unknown) {
 *   const errorObj = toErrorObject(err);
 *   logger.error('Operation failed', errorObj);
 *   res.status(500).json({ error: errorObj.message });
 * }
 * ```
 */
export function toErrorObject(error: unknown): { message: string; stack?: string } {
  const message = getErrorMessage(error);

  if (isErrorWithMessage(error) && error.stack) {
    return { message, stack: error.stack };
  }

  return { message };
}
