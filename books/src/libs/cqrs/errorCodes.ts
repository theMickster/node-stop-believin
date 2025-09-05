/**
 * Standardized error codes for the application
 * Used for programmatic error handling on the client side
 */
export const ErrorCodes = {
  // Validation errors (400)
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  INVALID_ISBN: 'INVALID_ISBN',
  INVALID_TITLE: 'INVALID_TITLE',
  INVALID_PUBLICATION_DATE: 'INVALID_PUBLICATION_DATE',
  INVALID_GENRE: 'INVALID_GENRE',
  INVALID_ID: 'INVALID_ID',
  INVALID_INPUT: 'INVALID_INPUT',

  // Not found errors (404)
  BOOK_NOT_FOUND: 'BOOK_NOT_FOUND',
  AUTHOR_NOT_FOUND: 'AUTHOR_NOT_FOUND',

  // Conflict errors (409)
  BOOK_ALREADY_EXISTS: 'BOOK_ALREADY_EXISTS',
  ISBN_CONFLICT: 'ISBN_CONFLICT',

  // Server errors (500)
  DATABASE_ERROR: 'DATABASE_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  REPOSITORY_ERROR: 'REPOSITORY_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
