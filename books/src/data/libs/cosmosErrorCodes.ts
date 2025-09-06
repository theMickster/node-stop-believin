/**
 * Cosmos DB Error Codes and Status Codes
 *
 * Based on official Azure Cosmos DB documentation:
 * - https://learn.microsoft.com/en-us/rest/api/cosmos-db/http-status-codes-for-cosmosdb
 * - https://learn.microsoft.com/en-us/azure/cosmos-db/nosql/troubleshoot-dotnet-sdk
 *
 * These codes help distinguish between different types of database errors
 * and enable appropriate error handling strategies (retry, fail, etc.)
 */

/**
 * Cosmos DB HTTP Status Codes
 * Maps to standard HTTP status codes returned by Cosmos DB operations
 */
export const CosmosStatusCodes = {
  /**
   * 200 - Operation successful
   */
  OK: 200,

  /**
   * 201 - Resource created successfully
   */
  CREATED: 201,

  /**
   * 204 - Operation successful (no content returned)
   */
  NO_CONTENT: 204,

  /**
   * 304 - Resource not modified (cached version is current)
   */
  NOT_MODIFIED: 304,

  /**
   * 400 - Bad request (invalid query, malformed JSON, etc.)
   */
  BAD_REQUEST: 400,

  /**
   * 401 - Unauthorized (invalid or missing authentication token)
   */
  UNAUTHORIZED: 401,

  /**
   * 403 - Forbidden (insufficient permissions, firewall rules, etc.)
   */
  FORBIDDEN: 403,

  /**
   * 404 - Resource not found
   */
  NOT_FOUND: 404,

  /**
   * 408 - Request timeout
   * Retryable error - operation took too long
   */
  REQUEST_TIMEOUT: 408,

  /**
   * 409 - Conflict (resource already exists with same ID)
   */
  CONFLICT: 409,

  /**
   * 412 - Precondition failed (ETag mismatch, optimistic concurrency failure)
   */
  PRECONDITION_FAILED: 412,

  /**
   * 413 - Request entity too large (document exceeds size limit)
   */
  REQUEST_ENTITY_TOO_LARGE: 413,

  /**
   * 429 - Too many requests (rate limiting, RU/s exceeded)
   * Retryable error - should implement backoff strategy
   */
  TOO_MANY_REQUESTS: 429,

  /**
   * 449 - Retry with (transient error, retry should succeed)
   * Retryable error
   */
  RETRY_WITH: 449,

  /**
   * 500 - Internal server error
   */
  INTERNAL_SERVER_ERROR: 500,

  /**
   * 503 - Service unavailable (Cosmos DB service is temporarily unavailable)
   * Retryable error
   */
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Type for Cosmos DB status codes
 */
export type CosmosStatusCode = (typeof CosmosStatusCodes)[keyof typeof CosmosStatusCodes];

/**
 * Error classification for handling strategies
 */
export enum CosmosErrorCategory {
  /**
   * Errors that should never be retried (bad request, not found, conflict, etc.)
   */
  PERMANENT = 'PERMANENT',

  /**
   * Errors that can be retried after a delay (timeout, rate limit, service unavailable)
   */
  RETRYABLE = 'RETRYABLE',

  /**
   * Errors related to authentication or authorization
   */
  AUTHENTICATION = 'AUTHENTICATION',

  /**
   * Errors that indicate a problem with the client code or data
   */
  CLIENT_ERROR = 'CLIENT_ERROR',

  /**
   * Errors that indicate a problem with the Cosmos DB service
   */
  SERVICE_ERROR = 'SERVICE_ERROR',
}

/**
 * Maps status codes to error categories
 * Used to determine retry strategy and error handling approach
 */
export const ErrorCategoryMap: Record<number, CosmosErrorCategory> = {
  [CosmosStatusCodes.BAD_REQUEST]: CosmosErrorCategory.CLIENT_ERROR,
  [CosmosStatusCodes.UNAUTHORIZED]: CosmosErrorCategory.AUTHENTICATION,
  [CosmosStatusCodes.FORBIDDEN]: CosmosErrorCategory.AUTHENTICATION,
  [CosmosStatusCodes.NOT_FOUND]: CosmosErrorCategory.PERMANENT,
  [CosmosStatusCodes.REQUEST_TIMEOUT]: CosmosErrorCategory.RETRYABLE,
  [CosmosStatusCodes.CONFLICT]: CosmosErrorCategory.PERMANENT,
  [CosmosStatusCodes.PRECONDITION_FAILED]: CosmosErrorCategory.PERMANENT,
  [CosmosStatusCodes.REQUEST_ENTITY_TOO_LARGE]: CosmosErrorCategory.CLIENT_ERROR,
  [CosmosStatusCodes.TOO_MANY_REQUESTS]: CosmosErrorCategory.RETRYABLE,
  [CosmosStatusCodes.RETRY_WITH]: CosmosErrorCategory.RETRYABLE,
  [CosmosStatusCodes.INTERNAL_SERVER_ERROR]: CosmosErrorCategory.SERVICE_ERROR,
  [CosmosStatusCodes.SERVICE_UNAVAILABLE]: CosmosErrorCategory.RETRYABLE,
};

/**
 * Human-readable error messages for each status code
 */
export const ErrorMessageMap: Record<number, string> = {
  [CosmosStatusCodes.BAD_REQUEST]: 'Invalid request format or query syntax',
  [CosmosStatusCodes.UNAUTHORIZED]: 'Authentication failed or token is invalid',
  [CosmosStatusCodes.FORBIDDEN]: 'Insufficient permissions to perform this operation',
  [CosmosStatusCodes.NOT_FOUND]: 'Resource not found',
  [CosmosStatusCodes.REQUEST_TIMEOUT]: 'Request timeout - operation took too long',
  [CosmosStatusCodes.CONFLICT]: 'Resource with this ID already exists',
  [CosmosStatusCodes.PRECONDITION_FAILED]: 'Optimistic concurrency check failed (ETag mismatch)',
  [CosmosStatusCodes.REQUEST_ENTITY_TOO_LARGE]: 'Document size exceeds maximum allowed size',
  [CosmosStatusCodes.TOO_MANY_REQUESTS]: 'Request rate too high - throttled by service',
  [CosmosStatusCodes.RETRY_WITH]: 'Transient error - retry should succeed',
  [CosmosStatusCodes.INTERNAL_SERVER_ERROR]: 'Internal server error occurred',
  [CosmosStatusCodes.SERVICE_UNAVAILABLE]: 'Service temporarily unavailable',
};

/**
 * Check if a status code represents a retryable error
 * @param statusCode - The HTTP status code from Cosmos DB
 * @returns true if the error should be retried
 */
export function isRetryableError(statusCode: number): boolean {
  const category = ErrorCategoryMap[statusCode];
  return category === CosmosErrorCategory.RETRYABLE;
}

/**
 * Get error category for a status code
 * @param statusCode - The HTTP status code from Cosmos DB
 * @returns The error category, or SERVICE_ERROR if unknown
 */
export function getErrorCategory(statusCode: number): CosmosErrorCategory {
  return ErrorCategoryMap[statusCode] ?? CosmosErrorCategory.SERVICE_ERROR;
}

/**
 * Get human-readable error message for a status code
 * @param statusCode - The HTTP status code from Cosmos DB
 * @returns A descriptive error message
 */
export function getErrorMessage(statusCode: number): string {
  return ErrorMessageMap[statusCode] ?? 'An unexpected error occurred';
}
