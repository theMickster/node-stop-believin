import { Request } from 'express';

import { PaginationParams, PAGINATION_DEFAULTS } from '@libs/types/pagination.types';

/**
 * Parses and validates pagination parameters from Express request query
 * Applies defaults and enforces constraints (max page size, positive numbers)
 *
 * Based on best practices from:
 * - REST API Design Rulebook by Mark Masse
 * - Microsoft Azure API Guidelines
 *
 * @param req - Express request object
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(req: Request): PaginationParams {
  const page = parsePositiveInteger(req.query.page as string, PAGINATION_DEFAULTS.PAGE);
  const pageSize = parsePositiveInteger(req.query.pageSize as string, PAGINATION_DEFAULTS.PAGE_SIZE);

  // Enforce maximum page size to prevent DOS attacks
  const validatedPageSize = Math.min(pageSize, PAGINATION_DEFAULTS.MAX_PAGE_SIZE);

  return {
    page,
    pageSize: validatedPageSize,
  };
}

/**
 * Parse string to positive integer with fallback
 * @param value - String value to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed positive integer or default
 */
function parsePositiveInteger(value: string | undefined, defaultValue: number): number {
  if (!value) {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  // Return default if: NaN, negative, zero, or not an integer
  if (isNaN(parsed) || parsed < 1 || !Number.isInteger(parsed)) {
    return defaultValue;
  }

  return parsed;
}
