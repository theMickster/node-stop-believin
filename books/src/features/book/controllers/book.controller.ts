import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { LogOperation } from '@libs/decorators/logging.decorators';
import {
  Get,
  Post,
  Put,
  Delete,
  RequireRoles,
  ExecutionContext as ExecutionContextDecorator,
} from '@libs/decorators/route.decorators';
import { ApiResponseMessages } from '@libs/http/apiResponseMessages';
import { CommandResponseHelper } from '@libs/http/commandResponseHelper';
import { QueryResponseHelper } from '@libs/http/queryResponseHelper';
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
    @inject(TYPES.ReadBookListHandler)
    private readonly readBookListHandler: IQueryHandler<ReadBookListQuery, ReadBookDto[]>,
    @inject(TYPES.ReadBookHandler) private readonly readBookHandler: IQueryHandler<ReadBookQuery, ReadBookDto | null>,
    @inject(TYPES.CreateBookCommandHandler)
    private readonly createBookCommandHandler: ICommandHandler<CreateBookCommand, Book>,
    @inject(TYPES.DeleteBookCommandHandler)
    private readonly deleteBookCommandHandler: ICommandHandler<DeleteBookCommand, void>,
    @inject(TYPES.UpdateBookCommandHandler)
    private readonly updateBookCommandHandler: ICommandHandler<UpdateBookCommand, Book>,
    // @ts-expect-error - Logger is used by @LogOperation decorator via getLoggerFromContext()
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  @Get('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @LogOperation('GetBooks')
  async getBooks(_req: Request, res: Response): Promise<void> {
    const query = new ReadBookListQuery();
    const result = await this.readBookListHandler.handle(query);

    QueryResponseHelper.handleJsonResult(res, result);
  }

  @Get('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @LogOperation('GetBookById')
  async getBookById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const query = new ReadBookQuery(id);
    const result = await this.readBookHandler.handle(query);

    QueryResponseHelper.handleNullableResult(
      res,
      result,
      ErrorCodes.BOOK_NOT_FOUND,
      ApiResponseMessages.BOOK_NOT_FOUND,
      (data) => {
        res.json(data);
      },
    );
  }

  @Post('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  @LogOperation('CreateBook')
  async createBook(
    req: Request<object, object, CreateBookDto>,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const command = new CreateBookCommand(req.body, context);
    const result = await this.createBookCommandHandler.handle(command);

    CommandResponseHelper.handleCreatedResult(res, result, (data) => {
      res.status(HttpStatus.CREATED).json(data);
    });
  }

  @Put('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  @LogOperation('UpdateBook')
  async updateBook(req: Request, res: Response, @ExecutionContextDecorator() context: ExecutionContext): Promise<void> {
    const command = new UpdateBookCommand(req.body, context);
    const result = await this.updateBookCommandHandler.handle(command);

    CommandResponseHelper.handleOkResult(res, result, (data) => {
      res.status(HttpStatus.OK).json(data);
    });
  }

  @Delete('/:id')
  @RequireRoles(authConfig.roles.admin)
  @LogOperation('DeleteBook')
  async deleteBook(req: Request, res: Response, @ExecutionContextDecorator() context: ExecutionContext): Promise<void> {
    const id = req.params.id;
    const command = new DeleteBookCommand(id, context);
    const result = await this.deleteBookCommandHandler.handle(command);

    CommandResponseHelper.handleNoContentResult(res, result);
  }
}
