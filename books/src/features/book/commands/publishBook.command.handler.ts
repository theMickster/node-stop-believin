import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { PublishBookCommand } from './publishBook.command';
import { PublishBookValidator } from '../validators/publishBook.validator';

@injectable()
export class PublishBookCommandHandler implements ICommandHandler<PublishBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: PublishBookCommand): Promise<Book> {
    const validationResult = PublishBookValidator.validate(command.publishBookDto, { abortEarly: false });
    if (validationResult.error) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      throw new Error('Book not found');
    }
    const book = bookResult.data;

    // Business rule: Cannot republish an already published book
    if (book.publishedDate) {
      throw new Error('Book is already published. Use update-publication endpoint to correct publication details.');
    }

    // Business rule: Validate ISBN uniqueness
    const isbnExistsResult = await this.bookRepository.isbnExists(validationResult.value.isbn);
    if (!isbnExistsResult.success) {
      throw new Error(isbnExistsResult.error ?? 'Failed to validate ISBN uniqueness');
    }
    if (isbnExistsResult.data) {
      const isbnValue = validationResult.value.isbn.isbn13 || validationResult.value.isbn.isbn10;
      throw new Error(`ISBN ${isbnValue} is already assigned to another book`);
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
      throw new Error(updateResult.error ?? 'Failed to publish book');
    }

    return updateResult.data;
  }
}
