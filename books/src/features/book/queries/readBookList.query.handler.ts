import { injectable, inject } from 'inversify';
import { ReadBookListQuery } from './readBookList.query';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { BookRepository } from '@data/repos/book.repository';
import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';

@injectable()
export class ReadBookListQueryHandler implements IQueryHandler<ReadBookListQuery, ReadBookDto[]> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(_query: ReadBookListQuery): Promise<QueryResult<ReadBookDto[]>> {
    const result = await this.bookRepository.getAll();

    if (result.success && result.data) {
      return queryOk(result.data.map(mapBookToReadBookDto));
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve books',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
