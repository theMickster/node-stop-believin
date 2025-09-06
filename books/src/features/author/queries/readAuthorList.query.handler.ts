import { injectable, inject } from 'inversify';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';
import { PaginatedResponse, PaginationMetadata } from '@libs/types/pagination.types';

import { mapAuthorToReadAuthorDto } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorDto } from '@features/author/models/readAuthorDto';

import { ReadAuthorListQuery } from './readAuthorList.query';

@injectable()
export class ReadAuthorListQueryHandler implements IQueryHandler<ReadAuthorListQuery, PaginatedResponse<ReadAuthorDto>> {
  constructor(@inject(TYPES.AuthorRepository) private readonly authorRepository: AuthorRepository) {}

  async handle(query: ReadAuthorListQuery): Promise<QueryResult<PaginatedResponse<ReadAuthorDto>>> {
    const result = await this.authorRepository.getAllPaginated(query.pagination, query.sortConfig);

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

      const paginatedResponse: PaginatedResponse<ReadAuthorDto> = {
        data: items.map(mapAuthorToReadAuthorDto),
        pagination: paginationMetadata,
      };

      return queryOk(paginatedResponse);
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve authors',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
