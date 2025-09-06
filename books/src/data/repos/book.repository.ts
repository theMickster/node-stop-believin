import { Container as CosmosContainer } from '@azure/cosmos';
import { inject, injectable } from 'inversify';

import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { RepoResult, repoOk, repoFail } from '@data/libs/repoResult';

import { CosmosRepository } from './base/cosmosRepository';



/**
 * Repository for Book entities
 * Inherits common CRUD operations (getAll, getById, create, update, delete) from CosmosRepository
 * Adds book-specific queries like ISBN existence checking
 */
@injectable()
export class BookRepository extends CosmosRepository<Book> {
  constructor(
    @inject(TYPES.BookContainer) container: CosmosContainer,
    @inject(TYPES.Logger) logger: ILogger,
  ) {
    super(container, ENTITY_TYPES.BOOK, 'book', logger);
  }

  /**
   * Check if a book with the given ISBN already exists
   * @param isbn - ISBN to check (isbn10 and/or isbn13)
   * @param excludeBookId - Optional book ID to exclude from check (for updates)
   * @returns true if ISBN exists, false otherwise
   */
  async isbnExists(isbn: { isbn10?: string; isbn13?: string }, excludeBookId?: string): Promise<RepoResult<boolean>> {
    try {
      // Build conditions dynamically to avoid matching empty strings
      const conditions: string[] = [];
      const parameters: Array<{ name: string; value: string }> = [{ name: '@entityType', value: ENTITY_TYPES.BOOK }];

      if (isbn.isbn10) {
        conditions.push('c.isbn.isbn10 = @isbn10');
        parameters.push({ name: '@isbn10', value: isbn.isbn10 });
      }

      if (isbn.isbn13) {
        conditions.push('c.isbn.isbn13 = @isbn13');
        parameters.push({ name: '@isbn13', value: isbn.isbn13 });
      }

      // If no ISBN values provided, return false (no match)
      if (conditions.length === 0) {
        return repoOk(false);
      }

      const isbnCondition = conditions.join(' OR ');
      const excludeCondition = excludeBookId ? ' AND c.id != @excludeBookId' : '';
      const query = `SELECT VALUE COUNT(1) FROM c WHERE c.entityType = @entityType AND (${isbnCondition})${excludeCondition}`;

      if (excludeBookId) {
        parameters.push({ name: '@excludeBookId', value: excludeBookId });
      }

      const result = await this.executeQuery<number>(query, parameters);

      if (!result.success || !result.data) {
        return repoFail('Failed to check ISBN existence', 500);
      }

      const count = result.data[0] || 0;
      return repoOk(count > 0);
    } catch {
      return repoFail('Failed to check ISBN existence', 500);
    }
  }
}
