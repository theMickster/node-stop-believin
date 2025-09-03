import { ICommand } from '@libs/cqrs/command';

import { PublishBookDto } from '../models/publishBookDto';

export class PublishBookCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly publishBookDto: PublishBookDto,
  ) {}
}
