import { Book } from '@data/entities/book';
import { mapCreateDtoToBook } from '@data/mapping/bookMappers';
import { BookRepository } from '@data/repos/bookRepository';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import TYPES from '@libs/ioc.types';
import { injectable, inject } from 'inversify';
import { v4 } from 'uuid';
import { CreateBookCommand } from './createBook.command';
import { CreateBookValidator } from '../validators/createBook.validator';

@injectable()
export class CreateBookCommandHandler implements ICommandHandler<CreateBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: CreateBookCommand): Promise<Book> {
    const { error, value: validatedDto } = CreateBookValidator.validate(command.createBookDto, { abortEarly: false });

    if (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }

    const newId = v4();
    const bookToCreate = mapCreateDtoToBook(newId, validatedDto);

    const result = await this.bookRepository.create(bookToCreate);
    if (!result.success || !result.data) {
      throw new Error(result.error ?? 'Unknown error creating book');
    }

    return result.data;
  }
}
