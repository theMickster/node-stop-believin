import { ErrorDetail } from './commandResult';

/**
 * Result type for query operations
 * Returns either success with data or failure with error details
 */
export type QueryResult<T> =
  | { success: true; data: T }
  | { success: false; error: ErrorDetail };

/**
 * Creates a successful query result
 */
export function queryOk<T>(data: T): QueryResult<T> {
  return { success: true, data };
}

/**
 * Creates a failed query result with detailed error information
 */
export function queryFail<T>(
  code: string,
  message: string,
  statusCode: number = 500,
  field?: string
): QueryResult<T> {
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
 * Type guard for successful query results
 */
export function isQueryOk<T>(result: QueryResult<T>): result is { success: true; data: T } {
  return result.success === true;
}

/**
 * Type guard for failed query results
 */
export function isQueryFail<T>(result: QueryResult<T>): result is { success: false; error: ErrorDetail } {
  return result.success === false;
}
