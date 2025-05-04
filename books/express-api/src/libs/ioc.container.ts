import { Container } from "inversify";
import TYPES from "./ioc.types";
import { BookController } from "../controllers/bookController";
import { BookRepository } from "../data/repos/bookRepository";
import { ReadBookListHandler } from "../features/book/queries/readBookListHandler";
import { ReadBookHandler } from "../features/book/queries/readBookQueryHander";
import { CreateBookCommandHandler } from "../features/book/commands/createBookCommandHandler";

const container = new Container();

// Bind Repositories
container.bind<BookRepository>(TYPES.BookRepository).to(BookRepository);

// Bind Query Handlers
container.bind<ReadBookListHandler>(TYPES.ReadBookListHandler).to(ReadBookListHandler);
container.bind<ReadBookHandler>(TYPES.ReadBookHandler).to(ReadBookHandler);

// Bind Command Handlers
container.bind<CreateBookCommandHandler>(TYPES.CreateBookCommandHandler).to(CreateBookCommandHandler);

// Bind Controllers
container.bind<BookController>(BookController).to(BookController);

export default container;