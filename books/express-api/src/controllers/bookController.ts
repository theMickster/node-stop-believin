import { Request, Response } from 'express';
import { ReadBookListQuery } from '../features/book/queries/readBookListQuery';
import { injectable, inject } from 'inversify';
import { CreateBookCommand } from '../features/book/commands/createBookCommand';
import { ReadBookQuery } from '../features/book/queries/readBookQuery';
import { ICommandHandler } from '../libs/cqrs/commandHandler';
import { IQueryHandler } from '../libs/cqrs/queryHandler';
import TYPES from '../libs/ioc.types';
import { CreateBookDto } from '../features/book/models/createBookDto';

@injectable()
export class BookController {
  constructor(
    @inject(TYPES.ReadBookListHandler) private readonly readBookListHandler: IQueryHandler<ReadBookListQuery, any>,
    @inject(TYPES.ReadBookHandler) private readonly readBookHandler: IQueryHandler<ReadBookQuery, any>,
    @inject(TYPES.CreateBookCommandHandler) private readonly createBookCommandHandler: ICommandHandler<CreateBookCommand, any>
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
          console.error(`Error fetching book ${id}:`, err);
          res.status(500).json({ error: 'Failed to fetch book' });
        }
      }

      async createBook(req: Request< {}, {}, CreateBookDto>, res: Response): Promise<void> {        
        try {
          const command = new CreateBookCommand(req.body);
          const createdBook = await this.createBookCommandHandler.handle(command);
          res.status(201).json(createdBook);
        } catch (err) {
          console.error('Error creating book:', err);
          res.status(500).json({ message: 'Failed to create book' });
        }
      }
  }