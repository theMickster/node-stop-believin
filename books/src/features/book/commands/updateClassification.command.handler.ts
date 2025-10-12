import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { UpdateClassificationCommand } from './updateClassification.command';
import { UpdateClassificationValidator } from '../validators/updateClassification.validator';

@injectable()
export class UpdateClassificationCommandHandler implements ICommandHandler<UpdateClassificationCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: UpdateClassificationCommand): Promise<Book> {
    // 1. Validate input
    const validationResult = UpdateClassificationValidator.validate(command.updateClassificationDto, {
      abortEarly: false,
    });
    if (validationResult.error) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    // 2. Fetch existing book
    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      throw new Error('Book not found');
    }
    const book = bookResult.data;

    // 3. Build updated library classification
    const dewey =
      validationResult.value.deweyDecimal !== undefined
        ? validationResult.value.deweyDecimal
        : book.libraryClassification?.deweyDecimal;
    const loc =
      validationResult.value.libraryOfCongressNumber !== undefined
        ? validationResult.value.libraryOfCongressNumber
        : book.libraryClassification?.libraryOfCongressNumber;
    const oclc =
      validationResult.value.oclcNumber !== undefined
        ? validationResult.value.oclcNumber
        : book.libraryClassification?.oclcNumber;

    // 4. Apply classification updates
    const now = new Date();
    const updatedBook: Book = {
      ...book,
      ...(dewey || loc || oclc
        ? {
            libraryClassification: {
              ...(dewey && { deweyDecimal: dewey }),
              ...(loc && { libraryOfCongressNumber: loc }),
              ...(oclc && { oclcNumber: oclc }),
            },
          }
        : {}),
      updatedAt: now,
      updatedBy: 'system', // TODO: Get from context/auth
      version: book.version + 1,
    };

    // 5. Persist
    const updateResult = await this.bookRepository.update(updatedBook);
    if (!updateResult.success || !updateResult.data) {
      throw new Error(updateResult.error ?? 'Failed to update classification');
    }

    return updateResult.data;
  }
}
