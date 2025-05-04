import Joi from 'joi';
import { CreateBookDto } from '../models/createBookDto';

export const CreateBookSchema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Book name is required',
    }),
    authors: Joi.array().items(
      Joi.object({
        firstName: Joi.string().min(2).required().messages({ 
            'string.min': 'First name must be at least 2 characters',
            'string.empty': 'First name is required',
        }),
        lastName: Joi.string().min(2).required().messages({
          'string.min': 'Last name must be at least 2 characters',
          'string.empty': 'Last name is required',
        }),
      }).required()
    ).min(1).messages({ 'array.min': 'At least one author is required' }),
  });
  
  export class CreateBookCommand {
    constructor(public readonly createBookDto: CreateBookDto) {}
  
    validate(): Joi.ValidationResult<CreateBookDto> {
      return CreateBookSchema.validate(this.createBookDto, { abortEarly: false });
    }
  }