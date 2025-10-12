import { Container as CosmosContainer, ItemResponse } from '@azure/cosmos';
import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { RepoResult, repoOk, repoFail } from '@data/libs/repoResult';
import { isErrorWithCode } from '@libs/guards/errorGuards';
import TYPES from '@libs/ioc.types';
import { inject, injectable } from 'inversify';

@injectable()
export class BookRepository {
  private readonly container: CosmosContainer;

  constructor(@inject(TYPES.BookContainer) container: CosmosContainer) {
    this.container = container;
  }

  async getAll(): Promise<RepoResult<Book[]>> {
    try {
      const querySpec = {
        query: 'SELECT * FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: ENTITY_TYPES.BOOK }],
      };

      const { resources: books } = await this.container.items.query<Book>(querySpec).fetchAll();
      return repoOk(books);
    } catch {
      return repoFail('Failed to retrieve books from the Cosmos DB.', 500);
    }
  }

  async getById(id: string): Promise<RepoResult<Book>> {
    try {
      const response: ItemResponse<Book> = await this.container.item(id, [id, ENTITY_TYPES.BOOK]).read<Book>();
      if (!response.resource) {
        const failResult = repoFail('Book not found', 404);
        return failResult;
      }
      return repoOk(response.resource);
    } catch (err: unknown) {
      if (isErrorWithCode(err) && (err.code === 404 || (err as { statusCode?: number }).statusCode === 404)) {
        const failResult = repoFail('Book not found', 404);
        return failResult;
      }
      return repoFail('Failed to retrieve book', 500);
    }
  }

  async create(book: Book): Promise<RepoResult<Book>> {
    try {
      const { resource: createdItem } = await this.container.items.create(book);
      if (!createdItem) {
        return repoFail('Failed to create book', 500);
      }
      return repoOk(createdItem);
    } catch {
      return repoFail('Failed to create book', 500);
    }
  }

  async update(book: Book): Promise<RepoResult<Book>> {
    try {
      const { resource: updatedItem } = await this.container.item(book.id, [book.id, ENTITY_TYPES.BOOK]).replace(book);
      if (!updatedItem) {
        return repoFail('Failed to update book', 500);
      }
      return repoOk(updatedItem);
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === 404) {
        return repoFail('Book not found', 404);
      }
      return repoFail('Failed to update book', 500);
    }
  }

  async delete(id: string): Promise<RepoResult<void>> {
    try {
      await this.container.item(id, [id, ENTITY_TYPES.BOOK]).delete();
      return repoOk(undefined);
    } catch (err: unknown) {
      if (isErrorWithCode(err) && err.code === 404) {
        return repoFail('Book not found', 404);
      }
      return repoFail('Failed to delete book', 500);
    }
  }

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

      const querySpec = { query, parameters };
      const { resources } = await this.container.items.query<number>(querySpec).fetchAll();
      const count = resources[0] || 0;
      return repoOk(count > 0);
    } catch {
      return repoFail('Failed to check ISBN existence', 500);
    }
  }
}
