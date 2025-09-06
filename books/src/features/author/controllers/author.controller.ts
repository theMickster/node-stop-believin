import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { LogOperation, CaptureContext } from '@libs/decorators/logging.decorators';
import {
  Get,
  Post,
  RequireRoles,
  ExecutionContext as ExecutionContextDecorator,
} from '@libs/decorators/route.decorators';
import { ApiResponseMessages } from '@libs/http/apiResponseMessages';
import { CommandResponseHelper } from '@libs/http/commandResponseHelper';
import { parsePaginationParams } from '@libs/http/paginationHelper';
import { QueryResponseHelper } from '@libs/http/queryResponseHelper';
import { parseSortParams } from '@libs/http/sortingHelper';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';
import { PaginatedResponse } from '@libs/types/pagination.types';

import { ExecutionContext } from '@middleware/requestContext';

import authConfig from '../../../config/authConfig';

import { Author } from '@data/entities/author.entity';

import { CreateAuthorCommand } from '@features/author/commands/createAuthor.command';
import { CreateAuthorDto } from '@features/author/models/createAuthorDto';
import { ReadAuthorDto } from '@features/author/models/readAuthorDto';
import { ReadAuthorQuery } from '@features/author/queries/readAuthor.query';
import { ReadAuthorListQuery } from '@features/author/queries/readAuthorList.query';
import { AuthorSortSpecification } from '@features/author/specifications/authorSort.specification';

@injectable()
export class AuthorController {
  constructor(
    @inject(TYPES.ReadAuthorListHandler)
    private readonly readAuthorListHandler: IQueryHandler<ReadAuthorListQuery, PaginatedResponse<ReadAuthorDto>>,
    @inject(TYPES.ReadAuthorHandler)
    private readonly readAuthorHandler: IQueryHandler<ReadAuthorQuery, ReadAuthorDto | null>,
    @inject(TYPES.CreateAuthorCommandHandler)
    private readonly createAuthorCommandHandler: ICommandHandler<CreateAuthorCommand, Author>,
    // @ts-expect-error - Logger is used by @LogOperation decorator via getLoggerFromContext()
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  @Get('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @LogOperation('GetAuthors')
  async getAuthors(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req);
    const sortConfig = parseSortParams(req, new AuthorSortSpecification());
    const query = new ReadAuthorListQuery(pagination, sortConfig);
    const result = await this.readAuthorListHandler.handle(query);

    QueryResponseHelper.handleJsonResult(res, result);
  }

  @Get('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @CaptureContext('authorId', 'params', 'id')
  @LogOperation('GetAuthorById')
  async getAuthorById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const query = new ReadAuthorQuery(id);
    const result = await this.readAuthorHandler.handle(query);

    QueryResponseHelper.handleNullableResult(
      res,
      result,
      ErrorCodes.AUTHOR_NOT_FOUND,
      ApiResponseMessages.AUTHOR_NOT_FOUND,
      (data) => {
        res.json(data);
      },
    );
  }

  @Post('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  @LogOperation('CreateAuthor')
  async createAuthor(
    req: Request<object, object, CreateAuthorDto>,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const command = new CreateAuthorCommand(req.body, context);
    const result = await this.createAuthorCommandHandler.handle(command);

    CommandResponseHelper.handleCreatedResult(res, result, (data) => {
      res.status(HttpStatus.CREATED).json(data);
    });
  }
}
