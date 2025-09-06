/**
 * Cosmos DB Error Handler
 *
 * Provides utilities for handling Cosmos DB errors with proper categorization,
 * context preservation, and error message sanitization.
 *
 */

import { getErrorMessage } from '@libs/guards/errorGuards';

import {
  CosmosStatusCodes,
  CosmosErrorCategory,
  getErrorCategory,
  getErrorMessage as getCosmosErrorMessage,
} from './cosmosErrorCodes';

/**
 * Structured error information for Cosmos DB operations
 * Safe to log and return to clients (no sensitive data)
 */
export interface CosmosErrorContext {
  /**
   * The operation that failed (e.g., 'getById', 'create', 'update')
   */
  operation: string;

  /**
   * The entity type being operated on (e.g., 'book', 'author')
   */
  entityType: string;

  /**
   * HTTP status code from Cosmos DB
   */
  statusCode: number;

  /**
   * Error category for handling strategy
   */
  category: CosmosErrorCategory;

  /**
   * Human-readable error message (sanitized, safe to show users)
   */
  message: string;

  /**
   * Whether this error can be retried
   */
  isRetryable: boolean;

  /**
   * Original error message (for logging only, may contain details)
   */
  originalMessage?: string;

  /**
   * Request charge (RU/s) if available
   */
  requestCharge?: number;

  /**
   * Activity ID for tracing in Azure portal
   */
  activityId?: string;
}

/**
 * Extract status code from various Cosmos DB error formats
 *
 * Cosmos DB errors can have status codes in different properties:
 * - error.code (number)
 * - error.statusCode (number)
 * - error.status (number)
 *
 * @param error - The caught error object
 * @returns The status code, or 500 if none found
 */
export function extractStatusCode(error: unknown): number {
  if (typeof error !== 'object' || error === null) {
    return CosmosStatusCodes.INTERNAL_SERVER_ERROR;
  }

  const err = error as Record<string, unknown>;

  // Check for code property (most common in Cosmos SDK)
  if (typeof err.code === 'number') {
    return err.code;
  }

  // Check for statusCode property
  if (typeof err.statusCode === 'number') {
    return err.statusCode;
  }

  // Check for status property
  if (typeof err.status === 'number') {
    return err.status;
  }

  // Default to 500 if no status code found
  return CosmosStatusCodes.INTERNAL_SERVER_ERROR;
}

/**
 * Extract request charge (RU/s) from Cosmos DB error
 *
 * @param error - The caught error object
 * @returns The request charge if available
 */
export function extractRequestCharge(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const err = error as Record<string, unknown>;

  if (typeof err.requestCharge === 'number') {
    return err.requestCharge;
  }

  // Some errors have headers object with request charge
  if (err.headers && typeof err.headers === 'object') {
    const headers = err.headers as Record<string, unknown>;
    if (typeof headers['x-ms-request-charge'] === 'number') {
      return headers['x-ms-request-charge'];
    }
    if (typeof headers['x-ms-request-charge'] === 'string') {
      const charge = Number.parseFloat(headers['x-ms-request-charge']);
      return Number.isNaN(charge) ? undefined : charge;
    }
  }

  return undefined;
}

/**
 * Extract activity ID from Cosmos DB error for tracing
 *
 * @param error - The caught error object
 * @returns The activity ID if available
 */
export function extractActivityId(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const err = error as Record<string, unknown>;

  if (typeof err.activityId === 'string') {
    return err.activityId;
  }

  // Some errors have headers object with activity ID
  if (err.headers && typeof err.headers === 'object') {
    const headers = err.headers as Record<string, unknown>;
    if (typeof headers['x-ms-activity-id'] === 'string') {
      return headers['x-ms-activity-id'];
    }
  }

  return undefined;
}

/**
 * Create structured error context from a Cosmos DB error
 *
 * This function extracts all relevant information from a Cosmos DB error
 * and packages it into a structured format that's safe to log and use
 * for error responses.
 *
 * @param error - The caught error from Cosmos DB operation
 * @param operation - The operation that failed (e.g., 'create', 'update')
 * @param entityType - The entity type (e.g., 'book', 'author')
 * @returns Structured error context
 *
 * @example
 * ```typescript
 * try {
 *   await container.item(id).read();
 * } catch (error: unknown) {
 *   const context = createErrorContext(error, 'getById', 'book');
 *   logger.error('Database operation failed', context);
 *   return repoFail(context.message, context.statusCode);
 * }
 * ```
 */
export function createErrorContext(error: unknown, operation: string, entityType: string): CosmosErrorContext {
  const statusCode = extractStatusCode(error);
  const category = getErrorCategory(statusCode);
  const originalMessage = getErrorMessage(error);
  const requestCharge = extractRequestCharge(error);
  const activityId = extractActivityId(error);

  // Get a safe, user-friendly message
  const message = getCosmosErrorMessage(statusCode);

  // Determine if error is retryable
  const isRetryable = category === CosmosErrorCategory.RETRYABLE;

  const context: CosmosErrorContext = {
    operation,
    entityType,
    statusCode,
    category,
    message,
    isRetryable,
  };

  // Only include optional properties if they have values
  if (originalMessage !== undefined) {
    context.originalMessage = originalMessage;
  }
  if (requestCharge !== undefined) {
    context.requestCharge = requestCharge;
  }
  if (activityId !== undefined) {
    context.activityId = activityId;
  }

  return context;
}

/**
 * Format error context into a loggable string
 * Includes all details for debugging
 *
 * @param context - The error context
 * @returns Formatted string for logging
 */
export function formatErrorForLogging(context: CosmosErrorContext): string {
  const parts = [
    `[${context.operation}]`,
    `Entity: ${context.entityType}`,
    `Status: ${context.statusCode}`,
    `Category: ${context.category}`,
    `Message: ${context.message}`,
  ];

  if (context.originalMessage && context.originalMessage !== context.message) {
    parts.push(`Original: ${context.originalMessage}`);
  }

  if (context.requestCharge !== undefined) {
    parts.push(`RU/s: ${context.requestCharge}`);
  }

  if (context.activityId) {
    parts.push(`ActivityId: ${context.activityId}`);
  }

  if (context.isRetryable) {
    parts.push('(Retryable)');
  }

  return parts.join(' | ');
}

/**
 * Sanitize error message for client response
 * Removes potentially sensitive information
 *
 * @param context - The error context
 * @returns Sanitized message safe for client
 */
export function sanitizeErrorForClient(context: CosmosErrorContext): string {
  // For production, only return generic messages for server errors
  // to avoid leaking implementation details
  if (context.category === CosmosErrorCategory.SERVICE_ERROR) {
    return `Failed to ${context.operation} ${context.entityType}`;
  }

  // For client errors, authentication errors, and permanent errors,
  // the standard message is safe to return
  return context.message;
}
