import { Book } from '@data/entities/book.entity';
import { PublishBookCommand } from '@features/book/commands/publishBook.command';
import { UpdatePublicationCommand } from '@features/book/commands/updatePublication.command';
import { PublishBookDto } from '@features/book/models/publishBookDto';
import { UpdatePublicationDto } from '@features/book/models/updatePublicationDto';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { getErrorMessage } from '@libs/guards/errorGuards';
import TYPES from '@libs/ioc.types';
import { ILogger } from '@libs/logging/logger.interface';
import { Request, Response } from 'express';
import { inject, injectable } from 'inversify';

@injectable()
export class BookPublishController {
  constructor(
    @inject(TYPES.PublishBookCommandHandler)
    private readonly publishBookCommandHandler: ICommandHandler<PublishBookCommand, Book>,
    @inject(TYPES.UpdatePublicationCommandHandler)
    private readonly updatePublicationCommandHandler: ICommandHandler<UpdatePublicationCommand, Book>,
    @inject(TYPES.Logger) private readonly logger: ILogger,
  ) {}

  async publishBook(req: Request<{ id: string }, object, PublishBookDto>, res: Response): Promise<void> {
    const bookId = req.params.id;
    try {
      const command = new PublishBookCommand(bookId, req.body);
      const publishedBook = await this.publishBookCommandHandler.handle(command);
      res.status(200).json(publishedBook);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      if (errorMsg.includes('already published')) {
        res.status(409).json({ error: errorMsg });
        return;
      }
      if (errorMsg.includes('ISBN') && errorMsg.includes('already assigned')) {
        res.status(409).json({ error: errorMsg });
        return;
      }
      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      this.logger.error('Failed to publish book', { error: errorMsg, bookId });
      res.status(500).json({ error: 'Failed to publish book' });
    }
  }

  async updatePublication(req: Request<{ id: string }, object, UpdatePublicationDto>, res: Response): Promise<void> {
    const bookId = req.params.id;
    try {
      const command = new UpdatePublicationCommand(bookId, req.body);
      const updatedBook = await this.updatePublicationCommandHandler.handle(command);
      res.status(200).json(updatedBook);
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);

      if (errorMsg.includes('not been published yet')) {
        res.status(400).json({ error: errorMsg });
        return;
      }
      if (errorMsg.includes('ISBN') && errorMsg.includes('already assigned')) {
        res.status(409).json({ error: errorMsg });
        return;
      }
      if (errorMsg.includes('not found')) {
        res.status(404).json({ error: 'Book not found' });
        return;
      }

      this.logger.error('Failed to update publication', { error: errorMsg, bookId });
      res.status(500).json({ error: 'Failed to update publication details' });
    }
  }
}
