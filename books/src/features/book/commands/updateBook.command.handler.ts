import { injectable, inject } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandFail, commandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';


import { Book } from '@data/entities/book.entity';
import { mapUpdateDtoToBook } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/book.repository';

import { UpdateBookValidator } from '../validators/updateBook.validator';

import { UpdateBookCommand } from './updateBook.command';


@injectable()
export class UpdateBookCommandHandler implements ICommandHandler<UpdateBookCommand, Book> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.UpdateBookValidator) private readonly validator: UpdateBookValidator,
  ) {}

  async handle(command: UpdateBookCommand): Promise<CommandResult<Book>> {
    const validationResult = await this.validator.validate(command.updateBookDto);

    if (!validationResult.valid) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        validationResult.error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    const model = mapUpdateDtoToBook(command.updateBookDto, command.context);
    const result = await this.bookRepository.update(model);

    if (!result.success || !result.data) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        result.error ?? 'Unknown error updating book',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return commandOk(result.data);
  }
}
