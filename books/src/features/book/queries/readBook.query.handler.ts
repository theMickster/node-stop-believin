import { injectable, inject } from 'inversify';
import { ReadBookQuery } from './readBook.query';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { BookRepository } from '@data/repos/bookRepository';
import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import TYPES from '@libs/ioc.types';

@injectable()
export class ReadBookQueryHandler implements IQueryHandler<ReadBookQuery, ReadBookDto | null> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookQuery): Promise<ReadBookDto | null> {
    const result = await this.bookRepository.getById(query.id);

    if (result.success && result.data) {
      return mapBookToReadBookDto(result.data);
    }

    if (result.statusCode === 404) {
      return null;
    }

    throw new Error(result.error ?? 'Failed to retrieve books');
  }
}
