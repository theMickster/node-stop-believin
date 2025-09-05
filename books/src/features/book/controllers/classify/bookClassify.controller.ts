import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';
import {
  ExecutionContext as ExecutionContextDecorator,
  Post,
  Put,
  RequireRoles,
} from '@libs/decorators/route.decorators';
import { CommandResponseHelper } from '@libs/http/commandResponseHelper';
import TYPES from '@libs/ioc.types';

import { ExecutionContext } from '@middleware/requestContext';

import { Book } from '@data/entities/book.entity';

import { ClassifyBookCommand } from '@features/book/commands/classifyBook.command';
import { UpdateClassificationCommand } from '@features/book/commands/updateClassification.command';
import { ClassifyBookDto } from '@features/book/models/classifyBookDto';
import { UpdateClassificationDto } from '@features/book/models/updateClassificationDto';

import authConfig from '../../../../config/authConfig';

@injectable()
export class BookClassifyController {
  constructor(
    @inject(TYPES.ClassifyBookCommandHandler)
    private readonly classifyBookCommandHandler: ICommandHandler<ClassifyBookCommand, Book>,
    @inject(TYPES.UpdateClassificationCommandHandler)
    private readonly updateClassificationCommandHandler: ICommandHandler<UpdateClassificationCommand, Book>,
  ) {}

  @Post('/:id/classify')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  async classifyBook(
    req: Request<{ id: string }, object, ClassifyBookDto>,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const bookId = req.params.id;
    const command = new ClassifyBookCommand(bookId, req.body, context);
    const result = await this.classifyBookCommandHandler.handle(command);

    CommandResponseHelper.handleOkResult(res, result, (data) => {
      res.status(HttpStatus.OK).json(data);
    });
  }

  @Put('/:id/classify')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  async updateClassification(
    req: Request<{ id: string }, object, UpdateClassificationDto>,
    res: Response,
    @ExecutionContextDecorator() context: ExecutionContext,
  ): Promise<void> {
    const bookId = req.params.id;
    const command = new UpdateClassificationCommand(bookId, req.body, context);
    const result = await this.updateClassificationCommandHandler.handle(command);

    CommandResponseHelper.handleOkResult(res, result, (data) => {
      res.status(HttpStatus.OK).json(data);
    });
  }
}
