import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { isQueryFail } from '@libs/cqrs/queryResult';
import { Get, Post, Put, Delete, RequireRoles, ExecutionContext as ExecutionContextDecorator } from '@libs/decorators/route.decorators';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import { ExecutionContext } from '@middleware/requestContext';

import authConfig from '../../../config/authConfig';

import { Book } from '@data/entities/book.entity';

import { CreateBookCommand } from '@features/book/commands/createBook.command';
import { DeleteBookCommand } from '@features/book/commands/deleteBook.command';
import { UpdateBookCommand } from '@features/book/commands/updateBook.command';
import { CreateBookDto } from '@features/book/models/createBookDto';
import { ReadBookDto } from '@features/book/models/readBookDto';
import { ReadBookQuery } from '@features/book/queries/readBook.query';
import { ReadBookListQuery } from '@features/book/queries/readBookList.query';



@injectable()
export class BookController {
  constructor(
    @inject(TYPES.ReadBookListHandler) private readonly readBookListHandler: IQueryHandler<ReadBookListQuery, ReadBookDto[]>,
    @inject(TYPES.ReadBookHandler) private readonly readBookHandler: IQueryHandler<ReadBookQuery, ReadBookDto | null>,
    @inject(TYPES.CreateBookCommandHandler) private readonly createBookCommandHandler: ICommandHandler<CreateBookCommand, Book>,
    @inject(TYPES.DeleteBookCommandHandler) private readonly deleteBookCommandHandler: ICommandHandler<DeleteBookCommand, void>,
    @inject(TYPES.UpdateBookCommandHandler) private readonly updateBookCommandHandler: ICommandHandler<UpdateBookCommand, Book>,
    @inject(TYPES.Logger) private readonly logger: ILogger
  ) {}

  @Get('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  async getBooks(req: Request, res: Response): Promise<void> {
    const query = new ReadBookListQuery();
    const result = await this.readBookListHandler.handle(query);

    if (isQueryFail(result)) {
      this.logger.error('Failed to fetch book list', {
        code: result.error.code,
        message: result.error.message,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
      return;
    }

    res.json(result.data);
  }

  @Get('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  async getBookById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const query = new ReadBookQuery(id);
    const result = await this.readBookHandler.handle(query);

    if (isQueryFail(result)) {
      this.logger.error('Failed to retrieve book', {
        code: result.error.code,
        message: result.error.message,
        bookId: id,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
      return;
    }

    // Handle null result - book not found
    if (result.data === null) {
      res.status(HttpStatus.NOT_FOUND).json({
        error: {
          code: ErrorCodes.BOOK_NOT_FOUND,
          message: 'Book not found',
        },
      });
      return;
    }

    res.json(result.data);
  }

  @Post('/')
  async createBook(
    req: Request<object, object, CreateBookDto>,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const command = new CreateBookCommand(req.body, context);
    const result = await this.createBookCommandHandler.handle(command);

    if (isCommandFail(result)) {
      this.logger.error('Failed to create book', {
        code: result.error.code,
        message: result.error.message,
        field: result.error.field,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
          field: result.error.field,
        },
      });
      return;
    }

    res.status(HttpStatus.CREATED).json(result.data);
  }

  @Put('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  async updateBook(
    req: Request,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const command = new UpdateBookCommand(req.body, context);
    const result = await this.updateBookCommandHandler.handle(command);

    if (isCommandFail(result)) {
      this.logger.error('Failed to update book', {
        code: result.error.code,
        message: result.error.message,
        field: result.error.field,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
          field: result.error.field,
        },
      });
      return;
    }

    res.status(HttpStatus.OK).json(result.data);
  }

  @Delete('/:id')
  @RequireRoles(authConfig.roles.admin)
  async deleteBook(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const command = new DeleteBookCommand(id);
    const result = await this.deleteBookCommandHandler.handle(command);

    if (isCommandFail(result)) {
      this.logger.error('Failed to delete book', {
        code: result.error.code,
        message: result.error.message,
        bookId: id,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
      return;
    }

    res.status(HttpStatus.NO_CONTENT).send();
  }
}
