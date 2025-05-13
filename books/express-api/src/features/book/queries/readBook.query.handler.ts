import { injectable, inject } from 'inversify';
import { Book } from '../../../data/entities/book';
import { BookRepository } from '../../../data/repos/bookRepository';
import { IQueryHandler } from '../../../libs/cqrs/queryHandler';
import TYPES from '../../../libs/ioc.types';
import { ReadBookQuery } from './readBook.query';

@injectable()
export class ReadBookQueryHandler implements IQueryHandler<ReadBookQuery, Book | null> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookQuery): Promise<Book | null> {
    const result = await this.bookRepository.getById(query.id);

    if (result.success && result.data) {
      return result.data;
    }

    throw new Error(result.error ?? 'Failed to retrieve books');
  }
}
