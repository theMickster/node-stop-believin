import { injectable, inject } from 'inversify';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';
import { PaginatedResponse, PaginationMetadata } from '@libs/types/pagination.types';

import { mapBookToReadBookDto } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { ReadBookDto } from '@features/book/models/readBookDto';

import { ReadBookListQuery } from './readBookList.query';

@injectable()
export class ReadBookListQueryHandler implements IQueryHandler<ReadBookListQuery, PaginatedResponse<ReadBookDto>> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(query: ReadBookListQuery): Promise<QueryResult<PaginatedResponse<ReadBookDto>>> {
    const result = await this.bookRepository.getAllPaginated(query.pagination, query.sortConfig);

    if (result.success && result.data) {
      const { items, totalCount } = result.data;

      // Calculate pagination metadata
      const totalPages = Math.ceil(totalCount / query.pagination.pageSize);

      const paginationMetadata: PaginationMetadata = {
        page: query.pagination.page,
        pageSize: query.pagination.pageSize,
        totalItems: totalCount,
        totalPages,
      };

      const paginatedResponse: PaginatedResponse<ReadBookDto> = {
        data: items.map(mapBookToReadBookDto),
        pagination: paginationMetadata,
      };

      return queryOk(paginatedResponse);
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve books',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
