import { injectable, inject } from 'inversify';
import { ReadBookListQuery } from './readBookList.query';
import { Book } from '@data/entities/book';
import { BookRepository } from '@data/repos/bookRepository';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import TYPES from '@libs/ioc.types';

@injectable()
export class ReadBookListQueryHandler implements IQueryHandler<ReadBookListQuery, Book[]> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookListQuery): Promise<Book[]> {
    const result = await this.bookRepository.getAll();
    
    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.error ?? 'Failed to retrieve books');

  }
}
