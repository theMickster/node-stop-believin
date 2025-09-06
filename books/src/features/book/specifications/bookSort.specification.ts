import { ISortSpecification, SortDirection } from '@libs/types/sorting.types';

import { Book } from '@data/entities/book.entity';

/**
 * Sort specification for Book entities
 * Defines allowed sort fields and their mappings to Cosmos DB field paths
 *
 * Allowed fields:
 * - id: Maps to bookId
 * - name: Maps to name (the book's title field)
 */
export class BookSortSpecification implements ISortSpecification<Book> {
  readonly allowedFields: ReadonlyMap<string, string> = new Map([
    ['id', 'c.bookId'],
    ['name', 'c.name'],
  ]);

  readonly defaultField = 'name';
  readonly defaultDirection = SortDirection.ASC;

  isFieldAllowed(field: string): boolean {
    return this.allowedFields.has(field);
  }

  getDbFieldPath(field: string): string | undefined {
    return this.allowedFields.get(field);
  }
}
