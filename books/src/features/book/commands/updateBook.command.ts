import { ICommand } from '@libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { UpdateBookDto } from '../models/updateBookDto';

export class UpdateBookCommand implements ICommand {
  constructor(
    public readonly updateBookDto: UpdateBookDto,
    public readonly context: ExecutionContext,
  ) {}
}
