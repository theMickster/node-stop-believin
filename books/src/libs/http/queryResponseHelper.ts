import { Response } from 'express';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { QueryResult, isQueryFail } from '@libs/cqrs/queryResult';

import { ApiResponseFields } from './apiResponseMessages';

/**
 * QueryResponseHelper
 *
 * Centralized utility for handling QueryResult -> HTTP Response conversion.
 * Eliminates code duplication across controllers by providing a standard way
 * to handle query results.
 *
 * Pattern: Railway Oriented Programming HTTP Adapter
 * Reference: https://fsharpforfunandprofit.com/rop/
 *
 * @example
 * ```typescript
 * const result = await this.readBookHandler.handle(query);
 * QueryResponseHelper.handleResult(res, result, (data) => {
 *   res.json(data);
 * });
 * ```
 */
export class QueryResponseHelper {
  /**
   * Handle a QueryResult and send appropriate HTTP response
   *
   * @param res - Express Response object
   * @param result - QueryResult from handler
   * @param onSuccess - Callback executed on success with the result data
   */
  static handleResult<T>(res: Response, result: QueryResult<T>, onSuccess: (data: T) => void): void {
    if (isQueryFail(result)) {
      QueryResponseHelper.sendErrorResponse(res, result);
      return;
    }

    onSuccess(result.data);
  }

  /**
   * Handle a QueryResult that may return null (e.g., getById operations)
   * Automatically sends 404 if data is null
   *
   * @param res - Express Response object
   * @param result - QueryResult from handler
   * @param notFoundCode - Error code to use for 404 response
   * @param notFoundMessage - Error message to use for 404 response
   * @param onSuccess - Callback executed on success with non-null data
   */
  static handleNullableResult<T>(
    res: Response,
    result: QueryResult<T | null>,
    notFoundCode: string,
    notFoundMessage: string,
    onSuccess: (data: T) => void,
  ): void {
    if (isQueryFail(result)) {
      QueryResponseHelper.sendErrorResponse(res, result);
      return;
    }

    if (result.data === null) {
      QueryResponseHelper.sendNotFoundResponse(res, notFoundCode, notFoundMessage);
      return;
    }

    onSuccess(result.data);
  }

  /**
   * Send standardized error response for failed queries
   *
   * @param res - Express Response object
   * @param result - Failed QueryResult
   */
  private static sendErrorResponse<T>(res: Response, result: QueryResult<T>): void {
    if (isQueryFail(result)) {
      const errorResponse = {
        [ApiResponseFields.ERROR]: {
          [ApiResponseFields.CODE]: result.error.code,
          [ApiResponseFields.MESSAGE]: result.error.message,
        },
      };

      res.status(result.error.statusCode).json(errorResponse);
    }
  }

  /**
   * Send standardized 404 Not Found response
   *
   * @param res - Express Response object
   * @param code - Error code
   * @param message - Error message
   */
  private static sendNotFoundResponse(res: Response, code: string, message: string): void {
    const errorResponse = {
      [ApiResponseFields.ERROR]: {
        [ApiResponseFields.CODE]: code,
        [ApiResponseFields.MESSAGE]: message,
      },
    };

    res.status(HttpStatus.NOT_FOUND).json(errorResponse);
  }

  /**
   * Handle query result with JSON response
   * Convenience method for standard list/collection queries
   */
  static handleJsonResult<T>(res: Response, result: QueryResult<T>): void {
    QueryResponseHelper.handleResult(res, result, (data) => {
      res.json(data);
    });
  }
}
