import { inject, injectable } from 'inversify';

import Joi from 'joi';
import { BookRepository } from '@data/repos/bookRepository';
import TYPES from '@libs/ioc.types';

@injectable()
export class DeleteBookValidator {
  private readonly schema = Joi.object({
    bookId: Joi.string().uuid({ version: 'uuidv4' }).required()
      .messages({
        'string.empty': 'Book ID must not be empty',
        'string.guid': 'Book ID must be a valid guid',
        'any.required': 'Book ID is required'
      })
  });

  constructor(
    @inject(TYPES.BookRepository) private readonly bookRepository: BookRepository
  ) {}

  async validate(bookId: string): Promise<{ valid: true } | { valid: false; error: Error }> {
    const { error } = this.schema.validate({ bookId });

    if (error) {
      return { valid: false, error: new Error(`Validation error: ${error.message}`) };
    }

    const result = await this.bookRepository.getById(bookId);

    if (!result.success || !result.data) {
      return { valid: false, error: new Error('Book not found') };
    }

    return { valid: true };
  }
}