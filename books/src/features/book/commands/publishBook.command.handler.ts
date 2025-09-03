import { injectable, inject } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import TYPES from '@libs/ioc.types';

import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/book.repository';


import { PublishBookValidator } from '../validators/publishBook.validator';

import { PublishBookCommand } from './publishBook.command';

@injectable()
export class PublishBookCommandHandler implements ICommandHandler<PublishBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: PublishBookCommand): Promise<CommandResult<Book>> {
    const validationResult = PublishBookValidator.validate(command.publishBookDto, { abortEarly: false });
    if (validationResult.error) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        `Validation failed: ${validationResult.error.message}`,
        HttpStatus.BAD_REQUEST
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
        HttpStatus.CONFLICT
      );
    }

    // Business rule: Validate ISBN uniqueness
    const isbnExistsResult = await this.bookRepository.isbnExists(validationResult.value.isbn);
    if (!isbnExistsResult.success) {
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        isbnExistsResult.error ?? 'Failed to validate ISBN uniqueness',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    if (isbnExistsResult.data) {
      const isbnValue = validationResult.value.isbn.isbn13 || validationResult.value.isbn.isbn10;
      return commandFail(ErrorCodes.ISBN_CONFLICT, `ISBN ${isbnValue} is already assigned to another book`, HttpStatus.CONFLICT);
    }

    // Apply publication data
    const now = new Date();
    const publishedDate = validationResult.value.publishedDate || now;
    const firstPublishedDate = validationResult.value.firstPublishedDate || publishedDate;

    const publishedBook: Book = {
      ...book,
      isbn: validationResult.value.isbn,
      publishedDate,
      firstPublishedDate,
      ...(validationResult.value.copyright && { copyright: validationResult.value.copyright }),
      edition: validationResult.value.edition || '1st Edition',
      ...(validationResult.value.bisacCodes && { bisacCodes: validationResult.value.bisacCodes }),
      ...(validationResult.value.thema && { thema: validationResult.value.thema }),
      updatedAt: now,
      updatedBy: 'system',
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
