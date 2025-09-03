import { ICommand } from 'libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { CreateBookDto } from '../models/createBookDto';

export class CreateBookCommand implements ICommand {
  constructor(
    public readonly createBookDto: CreateBookDto,
    public readonly context: ExecutionContext,
  ) {}
}
