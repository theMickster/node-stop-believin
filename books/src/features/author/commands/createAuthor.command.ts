import { ICommand } from 'libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { CreateAuthorDto } from '../models/createAuthorDto';

export class CreateAuthorCommand implements ICommand {
  constructor(
    public readonly createAuthorDto: CreateAuthorDto,
    public readonly context: ExecutionContext,
  ) {}
}
