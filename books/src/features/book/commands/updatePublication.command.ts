import { ICommand } from '@libs/cqrs/command';

import { ExecutionContext } from '@middleware/requestContext';

import { UpdatePublicationDto } from '../models/updatePublicationDto';

export class UpdatePublicationCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly updatePublicationDto: UpdatePublicationDto,
    public readonly context: ExecutionContext,
  ) {}
}
