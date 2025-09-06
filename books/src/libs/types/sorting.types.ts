/**
 * Sorting types and interfaces for query ordering
 * Following Specification Pattern to avoid hardcoding field mappings
 * Reference: Domain-Driven Design by Eric Evans, Specification Pattern
 */

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Sort parameters from request
 */
export interface SortParams {
  /**
   * Field name to sort by (e.g., 'name', 'id')
   */
  sortBy?: string;

  /**
   * Sort direction (asc or desc)
   */
  sortOrder?: SortDirection;
}

/**
 * Specification pattern interface for defining entity-specific sorting rules
 * Each entity implements this to define which fields can be sorted and how they map to DB fields
 */
export interface ISortSpecification<_T = unknown> {
  /**
   * Map of allowed sort field names to their database field paths
   * Example: { 'id': 'c.bookId', 'name': 'c.title' }
   */
  readonly allowedFields: ReadonlyMap<string, string>;

  /**
   * Default sort field if none specified
   */
  readonly defaultField: string;

  /**
   * Default sort direction if none specified
   */
  readonly defaultDirection: SortDirection;

  /**
   * Validate if a field is allowed for sorting
   */
  isFieldAllowed(field: string): boolean;

  /**
   * Get the database field path for a sort field
   * Returns undefined if field is not allowed
   */
  getDbFieldPath(field: string): string | undefined;
}

/**
 * Validated sort configuration ready to be applied to a query
 */
export interface ValidatedSortConfig {
  /**
   * The database field path to sort by (e.g., 'c.bookId')
   */
  dbFieldPath: string;

  /**
   * Sort direction
   */
  direction: SortDirection;
}

/**
 * Default sorting constants
 */
export const SORT_DEFAULTS = {
  DIRECTION: SortDirection.ASC,
} as const;
