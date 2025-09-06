import { inject, injectable } from 'inversify';
import Joi from 'joi';

import TYPES from '@libs/ioc.types';

import { BookRepository } from '@data/repos/book.repository';

import { UpdateBookDto } from '@features/book/models/updateBookDto';

import { AbstractBookValidator } from './abstractBook.validator';
import { BookAuthorsArraySchema } from './schemas/bookAuthorSchema';

/**
 * Validator for updating an existing book
 *
 * Combines Joi schema validation with domain validation (book exists check).
 * Uses shared BookAuthorsArraySchema to ensure consistent validation.
 */
@injectable()
export class UpdateBookValidator extends AbstractBookValidator<UpdateBookDto> {
  protected readonly schema = Joi.object({
    id: Joi.string().uuid({ version: 'uuidv4' }).required().messages({
      'string.empty': 'Book ID must not be empty',
      'string.guid': 'Book ID must be a valid guid',
      'any.required': 'Book ID is required',
    }),
    name: Joi.string().required().messages({
      'string.empty': 'Book name is required',
    }),
    authors: BookAuthorsArraySchema,
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
