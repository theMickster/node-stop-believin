import { inject, injectable } from 'inversify';
import TYPES from '../../../libs/ioc.types';
import { DeleteBookCommand } from './deleteBook.command';
import { BookRepository } from '../../../data/repos/bookRepository';
import { DeleteBookValidator } from '../validators/deleteBook.validator';
import { ICommandHandler } from '../../../libs/cqrs/commandHandler';
import { commandFail, commandOk, CommandResult } from '../../../libs/cqrs/commandResult';

@injectable()
export class DeleteBookCommandHandler implements ICommandHandler<DeleteBookCommand, CommandResult<void>>  {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.DeleteBookValidator) private readonly validator: DeleteBookValidator
  ) {}

async handle(command: DeleteBookCommand): Promise<CommandResult<void>> {
    const result = await this.validator.validate(command.id);
    
    if (!result.valid) {
      return commandFail(result.error.message, 'ValidationError');
    }

    try {
      await this.bookRepository.delete(command.id);
      return commandOk();
    } catch (error) {
      return commandFail('Unexpected error deleting book', 'InternalError');
    }
  }
}