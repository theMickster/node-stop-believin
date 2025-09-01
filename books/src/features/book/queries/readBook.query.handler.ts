import { injectable, inject } from 'inversify';
import { ReadBookQuery } from './readBook.query';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { BookRepository } from '@data/repos/book.repository';
import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';

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
