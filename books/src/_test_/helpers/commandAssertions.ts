import { CommandResult, isCommandOk, isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

/**
 * Assert that a command result is successful and optionally validate the data
 */
export function expectCommandSuccess<T>(
  result: CommandResult<T>,
  dataExpectations?: (data: T) => void,
): asserts result is { success: true; data: T } {
  expect(isCommandOk(result)).toBe(true);
  if (isCommandOk(result) && dataExpectations) {
    dataExpectations(result.data);
  }
}

/**
 * Assert that a command result is a failure with specific error details
 */
export function expectCommandError<T>(
  result: CommandResult<T>,
  errorCode: (typeof ErrorCodes)[keyof typeof ErrorCodes],
  statusCode: (typeof HttpStatus)[keyof typeof HttpStatus],
  messageContains?: string | string[],
): void {
  expect(isCommandFail(result)).toBe(true);
  if (isCommandFail(result)) {
    expect(result.error.code).toBe(errorCode);
    expect(result.error.statusCode).toBe(statusCode);

    if (messageContains) {
      const messages = Array.isArray(messageContains) ? messageContains : [messageContains];
      for (const msg of messages) {
        expect(result.error.message).toContain(msg);
      }
    }
  }
}

/**
 * Assert that a command result is a validation error
 */
export function expectValidationError<T>(
  result: CommandResult<T>,
  messageContains?: string | string[],
): void {
  expectCommandError(result, ErrorCodes.VALIDATION_FAILED, HttpStatus.BAD_REQUEST, messageContains);
}

/**
 * Assert that a command result is a not found error
 */
export function expectNotFoundError<T>(
  result: CommandResult<T>,
  message = 'Book not found',
): void {
  expectCommandError(result, ErrorCodes.BOOK_NOT_FOUND, HttpStatus.NOT_FOUND, message);
}

/**
 * Assert that a command result is a database error
 */
export function expectDatabaseError<T>(
  result: CommandResult<T>,
  messageContains?: string,
): void {
  expectCommandError(
    result,
    ErrorCodes.DATABASE_ERROR,
    HttpStatus.INTERNAL_SERVER_ERROR,
    messageContains,
  );
}

/**
 * Assert that a command result is a conflict error
 */
export function expectConflictError<T>(
  result: CommandResult<T>,
  messageContains?: string | string[],
): void {
  expectCommandError(result, ErrorCodes.ISBN_CONFLICT, HttpStatus.CONFLICT, messageContains);
}
