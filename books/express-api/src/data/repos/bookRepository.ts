import { Container as CosmosContainer, ItemResponse } from '@azure/cosmos';
import { Book } from '../entities/book';
import { inject, injectable } from 'inversify';
import TYPES from '../../libs/ioc.types';
import { mapCosmosDocumentToBook } from '../mapping/bookMappers';

@injectable()
export class BookRepository {
  private readonly container: CosmosContainer;

  constructor( @inject(TYPES.BookContainer) container: CosmosContainer) {
    this.container = container;
  }

  async getAll(): Promise<Book[]> {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.entityType = @entityType",
      parameters: [
        { name: "@entityType", value: "Book" }
      ]
    };

    const { resources: documents } = await this.container.items.query<Book>(querySpec).fetchAll();    
    return documents.map(m => mapCosmosDocumentToBook(m));
  }

  async getById(id: string): Promise<Book | null> {
    try {
      const response: ItemResponse<Book> = await this.container.item(id, [id, 'Book']).read<Book>();
      return response.resource ? mapCosmosDocumentToBook(response.resource) : null;
    } catch (err: any) {
      if (err.code === 404) {
        return null;
        };
        throw err;
    }
  }

  async create(book: Book): Promise<Book> {  
    const { resource: createdItem } = await this.container.items.create(book);
    if (!createdItem) {
      throw new Error('Book Repository :: Failed to create book');
    }
    return mapCosmosDocumentToBook(createdItem);
  }
}
