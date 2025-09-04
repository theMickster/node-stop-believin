import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandFail, commandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import { BookRepository } from '@data/repos/book.repository';

import { DeleteBookValidator } from '../validators/deleteBook.validator';

import { DeleteBookCommand } from './deleteBook.command';

@injectable()
export class DeleteBookCommandHandler implements ICommandHandler<DeleteBookCommand, void> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.DeleteBookValidator) private readonly validator: DeleteBookValidator,
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  async handle(command: DeleteBookCommand): Promise<CommandResult<void>> {
    const result = await this.validator.validate(command.id);

    if (!result.valid) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        result.error.message,
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      this.logger.info('Deleting book', {
        bookId: command.id,
        userId: command.context.userId,
        correlationId: command.context.correlationId,
        timestamp: command.context.timestamp,
      });

      await this.bookRepository.delete(command.id);

      // For void results, we need to pass undefined explicitly
      return commandOk(undefined as void);
    } catch (error: unknown) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        `Unexpected error deleting book: ${error instanceof Error ? error.message : 'Unknown error'}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
