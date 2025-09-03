import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { isCommandFail } from '@libs/cqrs/commandResult';
import { Post, Put, RequireRoles } from '@libs/decorators/route.decorators';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';

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
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  @Post('/:id/classify')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  async classifyBook(req: Request<{ id: string }, object, ClassifyBookDto>, res: Response): Promise<void> {
    const bookId = req.params.id;
    const command = new ClassifyBookCommand(bookId, req.body);
    const result = await this.classifyBookCommandHandler.handle(command);

    if (isCommandFail(result)) {
      this.logger.error('Failed to classify book', {
        code: result.error.code,
        message: result.error.message,
        bookId,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
      return;
    }

    res.status(200).json(result.data);
  }

  @Put('/:id/classify')
  @RequireRoles(authConfig.roles.admin, authConfig.roles.writer)
  async updateClassification(
    req: Request<{ id: string }, object, UpdateClassificationDto>,
    res: Response,
  ): Promise<void> {
    const bookId = req.params.id;
    const command = new UpdateClassificationCommand(bookId, req.body);
    const result = await this.updateClassificationCommandHandler.handle(command);

    if (isCommandFail(result)) {
      this.logger.error('Failed to update classification', {
        code: result.error.code,
        message: result.error.message,
        bookId,
      });
      res.status(result.error.statusCode).json({
        error: {
          code: result.error.code,
          message: result.error.message,
        },
      });
      return;
    }

    res.status(200).json(result.data);
  }
}
