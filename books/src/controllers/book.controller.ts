import { Book } from '@data/entities/book';
import { CreateBookCommand } from '@features/book/commands/createBook.command';
import { DeleteBookCommand } from '@features/book/commands/deleteBook.command';
import { UpdateBookCommand } from '@features/book/commands/updateBook.command';
import { CreateBookDto } from '@features/book/models/createBookDto';
import { ReadBookQuery } from '@features/book/queries/readBook.query';
import { ReadBookListQuery } from '@features/book/queries/readBookList.query';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class BookController {
  constructor(
    @inject(TYPES.ReadBookListHandler) private readonly readBookListHandler: IQueryHandler<ReadBookListQuery, Book[]>,
    @inject(TYPES.ReadBookHandler) private readonly readBookHandler: IQueryHandler<ReadBookQuery, Book>,
    @inject(TYPES.CreateBookCommandHandler) private readonly createBookCommandHandler: ICommandHandler<CreateBookCommand, Book>,
    @inject(TYPES.DeleteBookCommandHandler) private readonly deleteBookCommandHandler: ICommandHandler<DeleteBookCommand, void>,
    @inject(TYPES.UpdateBookCommandHandler) private readonly updateBookCommandHandler: ICommandHandler<UpdateBookCommand, Book>,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  async getBooks(req: Request, res: Response): Promise<void> {
    try {
      const query = new ReadBookListQuery();
      const books = await this.readBookListHandler.handle(query);
      res.json(books);
    } catch (err) {
      this.logger.error('Failed to fetch book list', { error: (err as Error).message });
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
      this.logger.error('Failed to retrieve book', { error: err.message, bookId: id });
      res.status(500).json({ error: 'Failed to retrieve book' });
    }
  }

  async createBook(req: Request<{}, {}, CreateBookDto>, res: Response): Promise<void> {
    try {
      const command = new CreateBookCommand(req.body);
      const createdBook = await this.createBookCommandHandler.handle(command);
      res.status(201).json(createdBook);
    } catch (err) {
      this.logger.error('Failed to create book', { error: (err as Error).message });
      res.status(500).json({ message: 'Failed to create book' });
    }
  }

  async updateBook(req: Request, res: Response): Promise<void> {    
    try {
      const command = new UpdateBookCommand(req.body);
      const updatedBook = await this.updateBookCommandHandler.handle(command);      
      res.status(200).json(updatedBook);
    } catch (err: any) {
      this.logger.error('Failed to update book', { error: err.message });
      res.status(500).json({ error: 'Failed to update book' });
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    try {
      const command = new DeleteBookCommand(id);
      await this.deleteBookCommandHandler.handle(command);
      res.status(204).send();
    } catch (err: any) {
      this.logger.error('Failed to delete book', { error: err.message, bookId: id });
      res.status(500).json({ error: "Failed to delete book" });
    }
  }
}
