import { injectable } from 'inversify';
import Joi from 'joi';

import { BaseValidator } from '@libs/validation/base.validator';

import { CreateBookDto } from '@features/book/models/createBookDto';

import { BookAuthorsArraySchema } from './schemas/bookAuthorSchema';

/**
 * Validator for creating a new book
 *
 * Uses shared BookAuthorsArraySchema to eliminate duplication
 * and ensure consistent validation across create/update operations.
 *
 * Since book creation only requires schema validation (no domain checks),
 * this validator directly extends BaseValidator instead of AbstractBookValidator.
 */
@injectable()
export class CreateBookValidator extends BaseValidator<CreateBookDto> {
  protected readonly schema = Joi.object({
    name: Joi.string().required().messages({
      'string.empty': 'Book name is required',
    }),
    authors: BookAuthorsArraySchema,
  });
}
