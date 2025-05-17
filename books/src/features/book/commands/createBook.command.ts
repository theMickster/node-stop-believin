import { CreateBookDto } from '../models/createBookDto';
import { ICommand } from 'libs/cqrs/command';

export class CreateBookCommand implements ICommand {
  constructor(public readonly createBookDto: CreateBookDto) {}
}
