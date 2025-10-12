import { Book } from '@data/entities/book.entity';
import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { ClassifyBookCommand } from './classifyBook.command';
import { ClassifyBookValidator } from '../validators/classifyBook.validator';

@injectable()
export class ClassifyBookCommandHandler implements ICommandHandler<ClassifyBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: ClassifyBookCommand): Promise<Book> {
    const validationResult = ClassifyBookValidator.validate(command.classifyBookDto, { abortEarly: false });
    if (validationResult.error) {
      throw new Error(`Validation failed: ${validationResult.error.message}`);
    }

    const bookResult = await this.bookRepository.getById(command.bookId);
    if (!bookResult.success || !bookResult.data) {
      throw new Error('Book not found');
    }

    const book = bookResult.data;
    const dewey = validationResult.value.deweyDecimal;
    const loc = validationResult.value.libraryOfCongressNumber;
    const oclc = validationResult.value.oclcNumber;
    const now = new Date();
    const classifiedBook: Book = {
      ...book,
      libraryClassification: {
        ...(dewey && { deweyDecimal: dewey }),
        ...(loc && { libraryOfCongressNumber: loc }),
        ...(oclc && { oclcNumber: oclc }),
      },
      updatedAt: now,
      updatedBy: 'system',
      version: book.version + 1,
    };

    const updateResult = await this.bookRepository.update(classifiedBook);
    if (!updateResult.success || !updateResult.data) {
      throw new Error(updateResult.error ?? 'Failed to classify book');
    }

    return updateResult.data;
  }
}
