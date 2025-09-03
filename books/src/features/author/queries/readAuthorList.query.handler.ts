import { injectable, inject } from 'inversify';

import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';

import { mapAuthorToReadAuthorDto } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorDto } from '@features/author/models/readAuthorDto';

import { ReadAuthorListQuery } from './readAuthorList.query';

@injectable()
export class ReadAuthorListQueryHandler implements IQueryHandler<ReadAuthorListQuery, ReadAuthorDto[]> {
  constructor(@inject(TYPES.AuthorRepository) private readonly authorRepository: AuthorRepository) {}

  async handle(_query: ReadAuthorListQuery): Promise<QueryResult<ReadAuthorDto[]>> {
    const result = await this.authorRepository.getAll();

    if (result.success && result.data) {
      return queryOk(result.data.map(mapAuthorToReadAuthorDto));
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve authors',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
