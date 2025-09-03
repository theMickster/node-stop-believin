import { injectable, inject } from 'inversify';
import { v4 } from 'uuid';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';

import { Book } from '@data/entities/book.entity';
import { mapCreateDtoToBook } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';


import { CreateBookValidator } from '../validators/createBook.validator';

import { CreateBookCommand } from './createBook.command';

@injectable()
export class CreateBookCommandHandler implements ICommandHandler<CreateBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: CreateBookCommand): Promise<CommandResult<Book>> {
    const validationResult = CreateBookValidator.validate(command.createBookDto, { abortEarly: false });

    if (validationResult.error) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        `Validation failed: ${validationResult.error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }

    const newId = v4();
    const bookToCreate = mapCreateDtoToBook(newId, validationResult.value, command.context);

    const result = await this.bookRepository.create(bookToCreate);
    if (!result.success || !result.data) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        result.error ?? 'Unknown error creating book',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return commandOk(result.data);
  }
}
