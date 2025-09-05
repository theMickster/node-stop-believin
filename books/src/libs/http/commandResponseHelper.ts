import { Response } from 'express';

import { CommandResult, isCommandFail } from '@libs/cqrs/commandResult';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import { ApiResponseFields } from './apiResponseMessages';

/**
 * CommandResponseHelper
 *
 * Centralized utility for handling CommandResult -> HTTP Response conversion.
 * Eliminates code duplication across controllers by providing a standard way
 * to handle command results.
 *
 * @example
 * ```typescript
 * const result = await this.createBookHandler.handle(command);
 * CommandResponseHelper.handleResult(res, result, HttpStatus.CREATED, (data) => {
 *   res.status(HttpStatus.CREATED).json(data);
 * });
 * ```
 */
export class CommandResponseHelper {
  /**
   * Handle a CommandResult and send appropriate HTTP response
   *
   * @param res - Express Response object
   * @param result - CommandResult from handler
   * @param successStatus - HTTP status code for success (default: 200)
   * @param onSuccess - Callback executed on success with the result data
   */
  static handleResult<T>(
    res: Response,
    result: CommandResult<T>,
    successStatus: number,
    onSuccess: (data: T) => void,
  ): void {
    if (isCommandFail(result)) {
      CommandResponseHelper.sendErrorResponse(res, result);
      return;
    }

    onSuccess(result.data);
  }

  /**
   * Send standardized error response for failed commands
   *
   * @param res - Express Response object
   * @param result - Failed CommandResult
   */
  private static sendErrorResponse<T>(res: Response, result: CommandResult<T>): void {
    if (isCommandFail(result)) {
      const errorResponse: Record<string, unknown> = {
        [ApiResponseFields.ERROR]: {
          [ApiResponseFields.CODE]: result.error.code,
          [ApiResponseFields.MESSAGE]: result.error.message,
        },
      };

      // Only include field if it exists
      if (result.error.field) {
        (errorResponse[ApiResponseFields.ERROR] as Record<string, unknown>)[ApiResponseFields.FIELD] =
          result.error.field;
      }

      res.status(result.error.statusCode).json(errorResponse);
    }
  }

  /**
   * Handle command result with standard 200 OK response
   */
  static handleOkResult<T>(res: Response, result: CommandResult<T>, onSuccess: (data: T) => void): void {
    CommandResponseHelper.handleResult(res, result, HttpStatus.OK, onSuccess);
  }

  /**
   * Handle command result with 201 CREATED response
   */
  static handleCreatedResult<T>(res: Response, result: CommandResult<T>, onSuccess: (data: T) => void): void {
    CommandResponseHelper.handleResult(res, result, HttpStatus.CREATED, onSuccess);
  }

  /**
   * Handle command result with 204 NO CONTENT response
   */
  static handleNoContentResult(res: Response, result: CommandResult<void>): void {
    CommandResponseHelper.handleResult(res, result, HttpStatus.NO_CONTENT, () => {
      res.status(HttpStatus.NO_CONTENT).send();
    });
  }
}
