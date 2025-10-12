import { PublishBookDto } from '../models/publishBookDto';
import { ICommand } from '@libs/cqrs/command';

export class PublishBookCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly publishBookDto: PublishBookDto,
  ) {}
}
