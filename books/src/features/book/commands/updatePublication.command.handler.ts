import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/book.repository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { CommandResult, commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
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

  async handle(command: UpdatePublicationCommand): Promise<CommandResult<Book>> {
    // 1. Validate input
    const validationResult = UpdatePublicationValidator.validate(command.updatePublicationDto, { abortEarly: false });
    if (validationResult.error) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        `Validation failed: ${validationResult.error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }

    // 2. Fetch existing book
    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      return commandFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND);
    }
    const book = bookResult.data;

    // 3. Business rule: Book must be published to update publication details
    if (!book.publishedDate) {
      return commandFail(
        ErrorCodes.VALIDATION_FAILED,
        'Cannot update publication information for a book that has not been published yet',
        HttpStatus.BAD_REQUEST
      );
    }

    // 4. Business rule: If updating ISBN, validate uniqueness (excluding current book)
    if (validationResult.value.isbn) {
      const isbnExistsResult = await this.bookRepository.isbnExists(validationResult.value.isbn, book.id);
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
      return commandFail(
        ErrorCodes.DATABASE_ERROR,
        updateResult.error ?? 'Failed to update publication information',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    // 7. Log the correction for audit purposes
    this.logger.info('Publication information updated', {
      bookId: book.bookId,
      reason: validationResult.value.reason,
      updatedBy: 'system',
      updatedAt: now,
    });

    return commandOk(updateResult.data);
  }
}
