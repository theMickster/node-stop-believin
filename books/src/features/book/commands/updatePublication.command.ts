import { UpdatePublicationDto } from '../models/updatePublicationDto';
import { ICommand } from '@libs/cqrs/command';

export class UpdatePublicationCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly updatePublicationDto: UpdatePublicationDto,
  ) {}
}
