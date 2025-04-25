import { Container, ItemResponse } from '@azure/cosmos';
import { Book } from '../models/book';

export class BookRepository {
  private container: Container;

  constructor(container: Container) {
    this.container = container;
  }

  async getAll(): Promise<Book[]> {
    const iterator = this.container.items.readAll<Book>();
    const { resources } = await iterator.fetchAll();
    return resources;
  }

  async getById(id: string): Promise<Book | null> {
    try {
      const response: ItemResponse<Book> = await this.container.item(id, id).read<Book>();
      return response.resource || null;
    } catch (err: any) {
      if (err.code === 404) {
        return null;
        };
        throw err;
    }
  }
}
