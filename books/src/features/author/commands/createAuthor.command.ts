import { CreateAuthorDto } from '../models/createAuthorDto';
import { ICommand } from 'libs/cqrs/command';

export class CreateAuthorCommand implements ICommand {
  constructor(public readonly createAuthorDto: CreateAuthorDto) {}
}
