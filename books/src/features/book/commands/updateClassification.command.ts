import { ICommand } from '@libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { UpdateClassificationDto } from '../models/updateClassificationDto';

export class UpdateClassificationCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly updateClassificationDto: UpdateClassificationDto,
    public readonly context: ExecutionContext,
  ) {}
}
