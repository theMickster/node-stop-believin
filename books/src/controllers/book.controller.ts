import { Book } from '@data/entities/book';
import { CreateBookCommand } from '@features/book/commands/createBook.command';
import { DeleteBookCommand } from '@features/book/commands/deleteBook.command';
import { CreateBookDto } from '@features/book/models/createBookDto';
import { ReadBookQuery } from '@features/book/queries/readBook.query';
import { ReadBookListQuery } from '@features/book/queries/readBookList.query';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import TYPES from '@libs/ioc.types';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class BookController {
  constructor(
    @inject(TYPES.ReadBookListHandler) private readonly readBookListHandler: IQueryHandler<ReadBookListQuery, Book[]>,
    @inject(TYPES.ReadBookHandler) private readonly readBookHandler: IQueryHandler<ReadBookQuery, Book>,
    @inject(TYPES.CreateBookCommandHandler) private readonly createBookCommandHandler: ICommandHandler<CreateBookCommand, Book>,
    @inject(TYPES.DeleteBookCommandHandler) private readonly deleteBookCommandHandler: ICommandHandler<DeleteBookCommand, void>
  ) {}

  async getBooks(req: Request, res: Response): Promise<void> {
    try {
      const query = new ReadBookListQuery();
      const books = await this.readBookListHandler.handle(query);
      res.json(books);
    } catch (err) {
      console.error('Error listing books:', err);
      res.status(500).json({ message: 'Failed to list books' });
    }
  }

  async getBookById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const query = new ReadBookQuery(id);
      const book = await this.readBookHandler.handle(query);
      if (!book) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }
      res.json(book);
    } catch (err: any) {
      console.error(`Error retrieving book ${id}:`, err);
      res.status(500).json({ error: 'Failed to retrieve book' });
    }
  }

  async createBook(req: Request<{}, {}, CreateBookDto>, res: Response): Promise<void> {
    try {
      const command = new CreateBookCommand(req.body);
      const createdBook = await this.createBookCommandHandler.handle(command);
      res.status(201).json(createdBook);
    } catch (err) {
      console.error('Error creating book:', err);
      res.status(500).json({ message: 'Failed to create book' });
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const command = new DeleteBookCommand(id);
      await this.deleteBookCommandHandler.handle(command);
      res.status(204).send();
    } catch (err: any) {
      console.error(`Error deleting book ${id}:`, err);
      res.status(500).json({ error: "Failed to delete book" });
    }
  }
}
