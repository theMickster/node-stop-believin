import { ICommand } from '@libs/cqrs/command';

import { UpdateClassificationDto } from '../models/updateClassificationDto';

export class UpdateClassificationCommand implements ICommand {
  constructor(
    public readonly bookId: string,
    public readonly updateClassificationDto: UpdateClassificationDto,
  ) {}
}
