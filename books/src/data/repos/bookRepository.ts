import { Container as CosmosContainer, ItemResponse } from '@azure/cosmos';
import { Book } from '@data/entities/book';
import { RepoResult, repoOk, repoFail } from '@data/libs/repoResult';
import { mapCosmosDocumentToBook } from '@data/mapping/bookMappers';
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
        parameters: [{ name: '@entityType', value: 'Book' }],
      };

      const { resources: documents } = await this.container.items.query<Book>(querySpec).fetchAll();
      const books = documents.map(mapCosmosDocumentToBook);
      return repoOk(books);
    } catch {
      return repoFail('Failed to retrieve books from the Cosmos DB.');
    }
  }

  async getById(id: string): Promise<RepoResult<Book>> {
    try {
      const response: ItemResponse<Book> = await this.container.item(id, [id, 'Book']).read<Book>();
      if (!response.resource) {
        return repoFail('Book not found');
      }
      return repoOk(mapCosmosDocumentToBook(response.resource));      
    } catch (err: any) {
      if (err.code === 404) {
        return repoFail('Book not found');
      }
      return repoFail('Failed to retrieve book');
    }
  }

  async create(book: Book): Promise<RepoResult<Book>> {
    try {
      const { resource: createdItem } = await this.container.items.create(book);
      if (!createdItem) {
        return repoFail('Failed to create book');
      }
      return repoOk(mapCosmosDocumentToBook(createdItem));
    } catch {
      return repoFail('Failed to create book');
    }
  }

  async update(book: Book): Promise<RepoResult<Book>> {
    try {
      const { resource: updatedItem } = await this.container.item(book.id, [book.id, 'Book']).replace(book);
      if (!updatedItem) {
        return repoFail('Failed to update book');
      }      
      return repoOk(mapCosmosDocumentToBook(updatedItem));
    }
    catch (err: any) {
      if (err.code === 404) {
        return repoFail('Book not found');
      }
      return repoFail('Failed to update book');
    }
  }

  async delete(id: string): Promise<RepoResult<void>> {
    try {
      await this.container.item(id, [id, 'Book']).delete();
      return repoOk(undefined);
    } catch (err: any) {
      if (err.code === 404) {
        return repoFail('Book not found');
      }
      return repoFail('Failed to delete book');
    }
  }
}
