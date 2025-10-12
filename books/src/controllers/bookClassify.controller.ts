import { Book } from '@data/entities/book.entity';
import { ClassifyBookCommand } from '@features/book/commands/classifyBook.command';
import { UpdateClassificationCommand } from '@features/book/commands/updateClassification.command';
import { ClassifyBookDto } from '@features/book/models/classifyBookDto';
import { UpdateClassificationDto } from '@features/book/models/updateClassificationDto';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { getErrorMessage } from '@libs/guards/errorGuards';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class BookClassifyController {
  constructor(
    @inject(TYPES.ClassifyBookCommandHandler)
    private readonly classifyBookCommandHandler: ICommandHandler<ClassifyBookCommand, Book>,
    @inject(TYPES.UpdateClassificationCommandHandler)
    private readonly updateClassificationCommandHandler: ICommandHandler<UpdateClassificationCommand, Book>,
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  async classifyBook(req: Request<{ id: string }, object, ClassifyBookDto>, res: Response): Promise<void> {
    const bookId = req.params.id;
    try {
      const command = new ClassifyBookCommand(bookId, req.body);
      const classifiedBook = await this.classifyBookCommandHandler.handle(command);
      res.status(200).json(classifiedBook);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      this.logger.error('Failed to classify book', { error: errorMsg, bookId });
      res.status(500).json({ error: 'Failed to classify book' });
    }
  }

  async updateClassification(
    req: Request<{ id: string }, object, UpdateClassificationDto>,
    res: Response,
  ): Promise<void> {
    const bookId = req.params.id;
    try {
      const command = new UpdateClassificationCommand(bookId, req.body);
      const updatedBook = await this.updateClassificationCommandHandler.handle(command);
      res.status(200).json(updatedBook);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      this.logger.error('Failed to update classification', { error: errorMsg, bookId });
      res.status(500).json({ error: 'Failed to update classification' });
    }
  }
}
