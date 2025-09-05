/**
 * Standard API response message constants
 * Centralized location for all error and success messages
 */
export const ApiResponseMessages = {
  // Generic errors
  NOT_FOUND: 'Resource not found',

  // Book-specific messages
  BOOK_NOT_FOUND: 'Book not found',

  // Author-specific messages
  AUTHOR_NOT_FOUND: 'Author not found',
} as const;

/**
 * Standard API response field names
 * Ensures consistency in JSON response structure
 */
export const ApiResponseFields = {
  ERROR: 'error',
  CODE: 'code',
  MESSAGE: 'message',
  FIELD: 'field',
} as const;
