import { Container as CosmosContainer } from '@azure/cosmos';
import { inject, injectable } from 'inversify';

import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import { Author } from '@data/entities/author.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';

import { CosmosRepository } from './base/cosmosRepository';

/**
 * Repository for Author entities
 * Inherits common CRUD operations (getAll, getById, create, update, delete) from CosmosRepository
 */
@injectable()
export class AuthorRepository extends CosmosRepository<Author> {
  constructor(
    @inject(TYPES.AuthorContainer) container: CosmosContainer,
    @inject(TYPES.Logger) logger: ILogger,
  ) {
    super(container, ENTITY_TYPES.AUTHOR, 'author', logger);
  }

  // Author-specific queries can be added here as needed
  // Example: async findByName(name: string): Promise<RepoResult<Author[]>>
}
