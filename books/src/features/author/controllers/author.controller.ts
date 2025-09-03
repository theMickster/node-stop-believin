import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { isCommandFail } from '@libs/cqrs/commandResult';
import { HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { isQueryFail } from '@libs/cqrs/queryResult';
import { LogOperation, CaptureContext } from '@libs/decorators/logging.decorators';
import { Get, Post, RequireRoles, ExecutionContext as ExecutionContextDecorator } from '@libs/decorators/route.decorators';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

import { ExecutionContext } from '@middleware/requestContext';

import authConfig from '../../../config/authConfig';

import { Author } from '@data/entities/author.entity';

import { CreateAuthorCommand } from '@features/author/commands/createAuthor.command';
import { CreateAuthorDto } from '@features/author/models/createAuthorDto';
import { ReadAuthorDto } from '@features/author/models/readAuthorDto';
import { ReadAuthorQuery } from '@features/author/queries/readAuthor.query';
import { ReadAuthorListQuery } from '@features/author/queries/readAuthorList.query';



@injectable()
export class AuthorController {
  constructor(
    @inject(TYPES.ReadAuthorListHandler) private readonly readAuthorListHandler: IQueryHandler<ReadAuthorListQuery, ReadAuthorDto[]>,
    @inject(TYPES.ReadAuthorHandler) private readonly readAuthorHandler: IQueryHandler<ReadAuthorQuery, ReadAuthorDto | null>,
    @inject(TYPES.CreateAuthorCommandHandler) private readonly createAuthorCommandHandler: ICommandHandler<CreateAuthorCommand, Author>,
    // @ts-expect-error - Logger is used by @LogOperation decorator via getLoggerFromContext()
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  @Get('/')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @LogOperation('GetAuthors')
  async getAuthors(_req: Request, res: Response): Promise<void> {
    const query = new ReadAuthorListQuery();
    const result = await this.readAuthorListHandler.handle(query);

    if (isQueryFail(result)) {
      res.status(result.error.statusCode).json({ message: 'Failed to list authors' });
      return;
    }

    res.json(result.data);
  }

  @Get('/:id')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.reader)
  @CaptureContext('authorId', 'params', 'id')
  @LogOperation('GetAuthorById')
  async getAuthorById(req: Request, res: Response): Promise<void> {
    const id = req.params.id;
    const query = new ReadAuthorQuery(id);
    const result = await this.readAuthorHandler.handle(query);

    if (isQueryFail(result)) {
      res.status(result.error.statusCode).json({ error: 'Failed to retrieve author' });
      return;
    }

    if (!result.data) {
      res.status(404).json({ error: 'Author not found' });
      return;
    }

    res.json(result.data);
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

    if (isCommandFail(result)) {
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
}
