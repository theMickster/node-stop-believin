import { ICommand } from '@libs/cqrs/command';

import { UpdatePublicationDto } from '../models/updatePublicationDto';

export class UpdatePublicationCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly updatePublicationDto: UpdatePublicationDto,
  ) {}
}
