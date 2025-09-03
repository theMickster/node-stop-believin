import { ICommand } from '@libs/cqrs/command';

import { ClassifyBookDto } from '../models/classifyBookDto';

export class ClassifyBookCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly classifyBookDto: ClassifyBookDto,
  ) {}
}
