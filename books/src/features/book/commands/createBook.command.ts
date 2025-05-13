import Joi from 'joi';
import { CreateBookDto } from '../models/createBookDto';
import { CreateBookValidator } from '../validators/createBook.validator';

export class CreateBookCommand {
  constructor(public readonly createBookDto: CreateBookDto) {}

  validate(): Joi.ValidationResult<CreateBookDto> {
    return CreateBookValidator.validate(this.createBookDto, { abortEarly: false });
  }
}
