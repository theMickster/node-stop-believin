import { ICommand } from '@libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { PublishBookDto } from '../models/publishBookDto';

export class PublishBookCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly publishBookDto: PublishBookDto,
    public readonly context: ExecutionContext,
  ) {}
}
