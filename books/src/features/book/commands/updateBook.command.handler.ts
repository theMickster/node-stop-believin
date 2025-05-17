import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandFail, commandOk } from '@libs/cqrs/commandResult';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { UpdateBookValidator } from '../validators/updateBook.validator';
import { UpdateBookCommand } from './updateBook.command';
import { mapUpdateDtoToBook } from '@data/mapping/bookMappers';
import { Book } from '@data/entities/book';

@injectable()
export class UpdateBookCommandHandler implements ICommandHandler<UpdateBookCommand, CommandResult<Book>> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.UpdateBookValidator) private readonly validator: UpdateBookValidator,
  ) {}

  async handle(command: UpdateBookCommand): Promise<CommandResult<Book>> {
    const validationResult = await this.validator.validate(command.updateBookDto);

    if (!validationResult.valid) {
      return commandFail(validationResult.error.message, 'ValidationError');
    }

    const model = mapUpdateDtoToBook(command.updateBookDto);
    const result = await this.bookRepository.update(model);

    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Unknown error updating book');
    }

    return commandOk(result.data);
  }
}
