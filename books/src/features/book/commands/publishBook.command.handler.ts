import { injectable, inject } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import TYPES from '@libs/ioc.types';

import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/book.repository';


import { PublishBookValidator } from '../validators/publishBook.validator';

import { PublishBookCommand } from './publishBook.command';

@injectable()
export class PublishBookCommandHandler implements ICommandHandler<PublishBookCommand, Book> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.PublishBookValidator) private readonly validator: PublishBookValidator,
  ) {}

  async handle(command: PublishBookCommand): Promise<CommandResult<Book>> {
    const validationResult = await this.validator.validate(command.publishBookDto);
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

    // Business rule: Cannot republish an already published book
    if (book.publishedDate) {
      return commandFail(
        ErrorCodes.BOOK_ALREADY_EXISTS,
        'Book is already published. Use update-publication endpoint to correct publication details.',
        HttpStatus.CONFLICT,
      );
    }

    // Business rule: Validate ISBN uniqueness
    const isbnExistsResult = await this.bookRepository.isbnExists(command.publishBookDto.isbn);
    if (!isbnExistsResult.success) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        isbnExistsResult.error ?? 'Failed to validate ISBN uniqueness',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    if (isbnExistsResult.data) {
      const isbnValue = command.publishBookDto.isbn.isbn13 || command.publishBookDto.isbn.isbn10;
      return commandFail(
        ErrorCodes.ISBN_CONFLICT,
        `ISBN ${isbnValue} is already assigned to another book`,
        HttpStatus.CONFLICT,
      );
    }

    // Apply publication data
    const timestamp = command.context.timestamp;
    const userId = command.context.userId ?? 'system';
    const publishedDate = command.publishBookDto.publishedDate || timestamp;
    const firstPublishedDate = command.publishBookDto.firstPublishedDate || publishedDate;

    const publishedBook: Book = {
      ...book,
      isbn: command.publishBookDto.isbn,
      publishedDate,
      firstPublishedDate,
      ...(command.publishBookDto.copyright && { copyright: command.publishBookDto.copyright }),
      edition: command.publishBookDto.edition || '1st Edition',
      ...(command.publishBookDto.bisacCodes && { bisacCodes: command.publishBookDto.bisacCodes }),
      ...(command.publishBookDto.thema && { thema: command.publishBookDto.thema }),
      updatedAt: timestamp,
      updatedBy: userId,
      version: book.version + 1,
    };

    const updateResult = await this.bookRepository.update(publishedBook);
    if (!updateResult.success || !updateResult.data) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        updateResult.error ?? 'Failed to publish book',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    return commandOk(updateResult.data);
  }
}
