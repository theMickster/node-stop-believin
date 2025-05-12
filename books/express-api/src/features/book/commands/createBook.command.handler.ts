import { injectable, inject } from "inversify";
import { v4 } from "uuid";
import { Book } from "../../../data/entities/book";
import { BookRepository } from "../../../data/repos/bookRepository";
import { ICommandHandler } from "../../../libs/cqrs/commandHandler";
import TYPES from "../../../libs/ioc.types";
import { CreateBookCommand } from "./createBook.command";
import { mapCreateDtoToBook } from "../../../data/mapping/bookMappers";

@injectable()
export class CreateBookCommandHandler implements ICommandHandler<CreateBookCommand, Book> {
  constructor(@inject(TYPES.BookRepository) private readonly bookRepository: BookRepository) {}

  async handle(command: CreateBookCommand): Promise<Book> {
    const { error, value: validatedDto } = command.validate();

    if (error) {
      throw error;
    }

    const newId = v4();
    const bookToCreate = mapCreateDtoToBook( newId, validatedDto);
    return this.bookRepository.create(bookToCreate);
  }
}