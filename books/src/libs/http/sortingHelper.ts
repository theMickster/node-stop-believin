import { Request } from 'express';

import { ISortSpecification, SortDirection, ValidatedSortConfig, SORT_DEFAULTS } from '@libs/types/sorting.types';

/**
 * Parses and validates sorting parameters from Express request
 * Uses Specification Pattern to validate against entity-specific allowed fields
 *
 * Based on:
 * - Specification Pattern (Domain-Driven Design)
 * - REST API Design best practices for sorting
 *
 * @param req - Express request object
 * @param specification - Sort specification defining allowed fields
 * @returns Validated sort configuration ready to use in queries
 */
export function parseSortParams<T>(
  req: Request,
  specification: ISortSpecification<T>
): ValidatedSortConfig {
  // Parse raw parameters from query string
  const sortBy = req.query.sortBy as string | undefined;
  const sortOrder = (req.query.sortOrder as string | undefined)?.toLowerCase();

  // Validate and normalize sort direction
  const direction = parseSortDirection(sortOrder);

  // If no sortBy provided, use default from specification
  if (!sortBy) {
    const dbFieldPath = specification.getDbFieldPath(specification.defaultField);
    if (!dbFieldPath) {
      throw new Error(`Default sort field '${specification.defaultField}' not found in specification`);
    }
    return {
      dbFieldPath,
      direction, // Use the parsed direction, not the default
    };
  }

  // Validate the requested field against specification
  if (!specification.isFieldAllowed(sortBy)) {
    // Fall back to default if invalid field requested
    const dbFieldPath = specification.getDbFieldPath(specification.defaultField);
    if (!dbFieldPath) {
      throw new Error(`Default sort field '${specification.defaultField}' not found in specification`);
    }
    return {
      dbFieldPath,
      direction: specification.defaultDirection,
    };
  }

  // Get the database field path from specification
  const dbFieldPath = specification.getDbFieldPath(sortBy);
  if (!dbFieldPath) {
    throw new Error(`Sort field '${sortBy}' is allowed but has no database mapping`);
  }

  return {
    dbFieldPath,
    direction,
  };
}

/**
 * Parse and validate sort direction
 * @param value - Raw sort direction string
 * @returns Validated SortDirection enum value
 */
function parseSortDirection(value: string | undefined): SortDirection {
  if (!value) {
    return SORT_DEFAULTS.DIRECTION;
  }

  const normalized = value.toLowerCase();
  if (normalized === 'asc' || normalized === 'ascending') {
    return SortDirection.ASC;
  }
  if (normalized === 'desc' || normalized === 'descending') {
    return SortDirection.DESC;
  }

  // Default to ASC if invalid value
  return SORT_DEFAULTS.DIRECTION;
}
