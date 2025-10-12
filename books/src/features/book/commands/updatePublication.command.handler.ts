import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { UpdatePublicationCommand } from './updatePublication.command';
import { UpdatePublicationValidator } from '../validators/updatePublication.validator';
import { ILogger } from '@libs/logging/logger.interface';

@injectable()
export class UpdatePublicationCommandHandler implements ICommandHandler<UpdatePublicationCommand, Book> {
  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository,
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  async handle(command: UpdatePublicationCommand): Promise<Book> {
    // 1. Validate input
    const validationResult = UpdatePublicationValidator.validate(command.updatePublicationDto, { abortEarly: false });
    if (validationResult.error) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // 2. Fetch existing book
    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      throw new Error('Book not found');
    }
    const book = bookResult.data;

    // 3. Business rule: Book must be published to update publication details
    if (!book.publishedDate) {
      throw new Error('Cannot update publication information for a book that has not been published yet');
    }

    // 4. Business rule: If updating ISBN, validate uniqueness (excluding current book)
    if (validationResult.value.isbn) {
      const isbnExistsResult = await this.bookRepository.isbnExists(validationResult.value.isbn, book.id);
      if (!isbnExistsResult.success) {
        throw new Error(isbnExistsResult.error ?? 'Failed to validate ISBN uniqueness');
      }
      if (isbnExistsResult.data) {
        const isbnValue = validationResult.value.isbn.isbn13 || validationResult.value.isbn.isbn10;
        throw new Error(`ISBN ${isbnValue} is already assigned to another book`);
      }
    }

    // 5. Apply publication updates
    const now = new Date();

    const updatedBook: Book = {
      ...book,
      ...(validationResult.value.isbn && { isbn: validationResult.value.isbn }),
      ...(validationResult.value.publishedDate && { publishedDate: validationResult.value.publishedDate }),
      ...(validationResult.value.copyright !== undefined && { copyright: validationResult.value.copyright }),
      ...(validationResult.value.edition && { edition: validationResult.value.edition }),
      updatedAt: now,
      updatedBy: 'system', // TODO: Get from context/auth
      version: book.version + 1,
    };

    // 6. Persist
    const updateResult = await this.bookRepository.update(updatedBook);
    if (!updateResult.success || !updateResult.data) {
      throw new Error(updateResult.error ?? 'Failed to update publication information');
    }

    // 7. Log the correction for audit purposes
    this.logger.info('Publication information updated', {
      bookId: book.bookId,
      reason: validationResult.value.reason,
      updatedBy: 'system',
      updatedAt: now,
    });

    return updateResult.data;
  }
}
