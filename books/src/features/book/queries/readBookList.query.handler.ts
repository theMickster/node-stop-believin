import { injectable, inject } from 'inversify';
import { ReadBookListQuery } from './readBookList.query';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { BookRepository } from '@data/repos/bookRepository';
import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import TYPES from '@libs/ioc.types';

@injectable()
export class ReadBookListQueryHandler implements IQueryHandler<ReadBookListQuery, ReadBookDto[]> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(_query: ReadBookListQuery): Promise<ReadBookDto[]> {
    const result = await this.bookRepository.getAll();

    if (result.success && result.data) {
      return result.data.map(mapBookToReadBookDto);
    }

    throw new Error(result.error ?? 'Failed to retrieve books');

  }
}
