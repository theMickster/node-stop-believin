import { Container, ItemResponse } from '@azure/cosmos';
import { Book, mapToBook } from '../entities/book';

export class BookRepository {
  private readonly container: Container;

  constructor(container: Container) {
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
    return documents.map(m => mapToBook(m));
  }

  async getById(id: string): Promise<Book | null> {
    try {
      const response: ItemResponse<Book> = await this.container.item(id, [id, 'Book']).read<Book>();
      return response.resource ? mapToBook(response.resource) : null;
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
    return mapToBook(createdItem);
  }
}
