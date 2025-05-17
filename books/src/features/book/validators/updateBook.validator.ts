import { inject, injectable } from 'inversify';
import Joi from 'joi';
import { BookRepository } from '@data/repos/bookRepository';
import TYPES from '@libs/ioc.types';
import { UpdateBookDto } from '@features/book/models/updateBookDto';
import { AbstractBookValidator } from './abstractBook.validator';

@injectable()
export class UpdateBookValidator extends AbstractBookValidator<UpdateBookDto> {
  private readonly schema = Joi.object({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.empty': 'Book ID must not be empty',
      'string.guid': 'Book ID must be a valid guid',
      'any.required': 'Book ID is required',
    }),
    name: Joi.string().required().messages({
      'string.empty': 'Book name is required',
    }),
    authors: Joi.array()
      .items(
        Joi.object({
          authorId: Joi.string().guid({ version: 'uuidv4' }).required().messages({
            'string.guid': 'Author ID must be a valid GUID',
            'string.empty': 'Author ID is required',
          }),
          firstName: Joi.string().min(2).required().messages({
            'string.min': 'First name must be at least 2 characters',
            'string.empty': 'First name is required',
          }),
          lastName: Joi.string().min(2).required().messages({
            'string.min': 'Last name must be at least 2 characters',
            'string.empty': 'Last name is required',
          }),
        }).required(),
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'At least one author is required',
        'array.includesRequiredUnknowns': 'At least one author is required',
        'any.required': 'Authors are required',
        'array.base': 'Authors must be an array',
      }),
  });

  constructor(@inject(TYPES.BookRepository) bookRepository: BookRepository) {
    super(bookRepository);
  }

  async validate(dto: UpdateBookDto): Promise<{ valid: true } | { valid: false; error: Error }> {
    const { error } = this.schema.validate(dto);
    if (error) {
      return { valid: false, error: new Error(`Validation error: ${error.message}`) };
    }

    return await this.validateBookExists(dto.id);
  }
}
