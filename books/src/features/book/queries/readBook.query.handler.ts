import { injectable, inject } from 'inversify';

import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';

import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookDto } from '@features/book/models/readBookDto';

import { ReadBookQuery } from './readBook.query';

@injectable()
export class ReadBookQueryHandler implements IQueryHandler<ReadBookQuery, ReadBookDto | null> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookQuery): Promise<QueryResult<ReadBookDto | null>> {
    const result = await this.bookRepository.getById(query.id);

    if (result.success && result.data) {
      return queryOk(mapBookToReadBookDto(result.data));
    }

    if (result.statusCode === 404) {
      return queryOk(null);
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve book',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
