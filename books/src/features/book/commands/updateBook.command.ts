import { ICommand } from '@libs/cqrs/command';
import { UpdateBookDto } from '../models/updateBookDto';

export class UpdateBookCommand implements ICommand {
  constructor(public readonly updateBookDto: UpdateBookDto) {}
}
