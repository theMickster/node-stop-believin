import { injectable, inject } from 'inversify';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';

import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookDto } from '@features/book/models/readBookDto';

import { ReadBookListQuery } from './readBookList.query';

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
