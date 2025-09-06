import { ISortSpecification, SortDirection } from '@libs/types/sorting.types';

import { Author } from '@data/entities/author.entity';

/**
 * Sort specification for Author entities
 * Defines allowed sort fields and their mappings to Cosmos DB field paths
 *
 * Allowed fields:
 * - id: Maps to authorId
 * - lastName: Maps to lastName
 * - firstName: Maps to firstName
 * - displayName: Maps to displayName
 */
export class AuthorSortSpecification implements ISortSpecification<Author> {
  readonly allowedFields: ReadonlyMap<string, string> = new Map([
    ['id', 'c.authorId'],
    ['lastName', 'c.lastName'],
    ['firstName', 'c.firstName'],
    ['displayName', 'c.displayName'],
  ]);

  readonly defaultField = 'lastName';
  readonly defaultDirection = SortDirection.ASC;

  isFieldAllowed(field: string): boolean {
    return this.allowedFields.has(field);
  }

  getDbFieldPath(field: string): string | undefined {
    return this.allowedFields.get(field);
  }
}
