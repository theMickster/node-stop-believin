import { injectable, inject } from 'inversify';
import { v4 } from 'uuid';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import TYPES from '@libs/ioc.types';

import { Author } from '@data/entities/author.entity';
import { mapCreateDtoToAuthor } from '@data/mapping/authorMappers';
import { AuthorRepository } from '@data/repos/author.repository';


import { CreateAuthorValidator } from '../validators/createAuthor.validator';

import { CreateAuthorCommand } from './createAuthor.command';

@injectable()
export class CreateAuthorCommandHandler implements ICommandHandler<CreateAuthorCommand, Author> {
  constructor(@inject(TYPES.AuthorRepository) private readonly authorRepository: AuthorRepository) {}

  async handle(command: CreateAuthorCommand): Promise<CommandResult<Author>> {
    const validationResult = CreateAuthorValidator.validate(command.createAuthorDto, { abortEarly: false });

    if (validationResult.error) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        `Validation failed: ${validationResult.error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const newId = v4();
    const authorToCreate = mapCreateDtoToAuthor(newId, validationResult.value, command.context);

    const result = await this.authorRepository.create(authorToCreate);
    if (!result.success || !result.data) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        result.error ?? 'Unknown error creating author',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return commandOk(result.data);
  }
}
