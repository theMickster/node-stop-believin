import { injectable, inject } from "inversify";
import { v4 } from "uuid";
import { Book, mapToBook } from "../../../data/entities/book";
import { BookRepository } from "../../../data/repos/bookRepository";
import { ICommandHandler } from "../../../libs/cqrs/commandHandler";
import TYPES from "../../../libs/ioc.types";
import { CreateBookCommand } from "./createBookCommand";

@injectable()
export class CreateBookCommandHandler implements ICommandHandler<CreateBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: CreateBookCommand): Promise<Book> {
    const { error, value: validatedDto } = command.validate();

    if (error) {
      throw error;
    }

    const newId = v4();
    const bookToCreate = mapToBook({
      ...validatedDto,
      id: newId,
      BookId: newId,
      Type: 'Book',
    });
    return this.bookRepository.create(bookToCreate);
  }
}