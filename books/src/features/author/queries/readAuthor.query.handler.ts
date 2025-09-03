import { injectable, inject } from 'inversify';

import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { QueryResult, queryOk, queryFail } from '@libs/cqrs/queryResult';
import TYPES from '@libs/ioc.types';

import { mapAuthorToReadAuthorDto } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';

import { ReadAuthorDto } from '@features/author/models/readAuthorDto';

import { ReadAuthorQuery } from './readAuthor.query';

@injectable()
export class ReadAuthorQueryHandler implements IQueryHandler<ReadAuthorQuery, ReadAuthorDto | null> {
  constructor(@inject(TYPES.AuthorRepository) private readonly authorRepository: AuthorRepository) {}

  async handle(query: ReadAuthorQuery): Promise<QueryResult<ReadAuthorDto | null>> {
    const result = await this.authorRepository.getById(query.id);

    if (result.success && result.data) {
      return queryOk(mapAuthorToReadAuthorDto(result.data));
    }

    if (result.statusCode === 404) {
      return queryOk(null);
    }

    return queryFail(
      ErrorCodes.DATABASE_ERROR,
      result.error ?? 'Failed to retrieve author',
      HttpStatus.INTERNAL_SERVER_ERROR
    );
  }
}
