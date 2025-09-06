/**
 * Pagination request parameters
 * Following REST API best practices for offset-based pagination
 * Reference: Microsoft Azure API Guidelines, RFC 5988
 */
export interface PaginationParams {
  /**
   * Current page number (1-based indexing)
   * @minimum 1
   */
  page: number;

  /**
   * Number of items per page
   * @minimum 1
   * @maximum 100
   */
  pageSize: number;
}

/**
 * Pagination metadata included in responses
 */
export interface PaginationMetadata {
  /**
   * Current page number
   */
  page: number;

  /**
   * Items per page
   */
  pageSize: number;

  /**
   * Total number of items across all pages
   */
  totalItems: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Paginated response envelope
 * Wraps data with pagination metadata
 */
export interface PaginatedResponse<T> {
  /**
   * The data items for the current page
   */
  data: T[];

  /**
   * Pagination metadata
   */
  pagination: PaginationMetadata;
}

/**
 * Default pagination constants
 */
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
} as const;
