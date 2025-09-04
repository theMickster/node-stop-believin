import { ICommand } from '@libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

export class DeleteBookCommand implements ICommand {
  constructor(
    public readonly id: string,
    public readonly context: ExecutionContext,
  ) {}
}
