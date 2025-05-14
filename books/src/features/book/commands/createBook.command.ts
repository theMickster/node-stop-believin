import Joi from 'joi';
import { CreateBookDto } from '../models/createBookDto';
import { CreateBookValidator } from '../validators/createBook.validator';
import { ICommand } from 'libs/cqrs/command';

export class CreateBookCommand implements ICommand {
  constructor(public readonly createBookDto: CreateBookDto) {}

  validate(): Joi.ValidationResult<CreateBookDto> {
    return CreateBookValidator.validate(this.createBookDto, { abortEarly: false });
  }
}
