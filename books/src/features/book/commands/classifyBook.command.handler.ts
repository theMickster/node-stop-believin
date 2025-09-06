import { injectable, inject } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import TYPES from '@libs/ioc.types';

import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/book.repository';


import { ClassifyBookValidator } from '../validators/classifyBook.validator';

import { ClassifyBookCommand } from './classifyBook.command';

@injectable()
export class ClassifyBookCommandHandler implements ICommandHandler<ClassifyBookCommand, Book> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.ClassifyBookValidator) private readonly validator: ClassifyBookValidator,
  ) {}

  async handle(command: ClassifyBookCommand): Promise<CommandResult<Book>> {
    const validationResult = await this.validator.validate(command.classifyBookDto);
    if (!validationResult.valid) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        validationResult.error.message,
        HttpStatus.BAD_REQUEST,
      );
    }

    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      return commandFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND);
    }

    const book = bookResult.data;
    const dewey = command.classifyBookDto.deweyDecimal;
    const loc = command.classifyBookDto.libraryOfCongressNumber;
    const oclc = command.classifyBookDto.oclcNumber;
    const timestamp = command.context.timestamp;
    const userId = command.context.userId ?? 'system';
    const classifiedBook: Book = {
      ...book,
      libraryClassification: {
        ...(dewey && { deweyDecimal: dewey }),
        ...(loc && { libraryOfCongressNumber: loc }),
        ...(oclc && { oclcNumber: oclc }),
      },
      updatedAt: timestamp,
      updatedBy: userId,
      version: book.version + 1,
    };

    const updateResult = await this.bookRepository.update(classifiedBook);
    if (!updateResult.success || !updateResult.data) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        updateResult.error ?? 'Failed to classify book',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return commandOk(updateResult.data);
  }
}
