import { injectable } from 'inversify';
import Joi from 'joi';

import { BaseValidator } from '@libs/validation/base.validator';

import { PublishBookDto } from '../models/publishBookDto';

/**
 * Reusable ISBN schema for validating ISBN-10 and ISBN-13
 * Exported for potential reuse in other validators
 */
export const isbnSchema = Joi.object({
  isbn10: Joi.string()
    .pattern(/^\d{10}$/)
    .optional()
    .messages({
      'string.pattern.base': 'ISBN-10 must be exactly 10 digits',
    }),
  isbn13: Joi.string()
    .pattern(/^\d{13}$/)
    .optional()
    .messages({
      'string.pattern.base': 'ISBN-13 must be exactly 13 digits',
    }),
})
  .or('isbn10', 'isbn13')
  .messages({
    'object.missing': 'Either isbn10 or isbn13 must be provided',
  });

/**
 * Validator for publishing a book
 *
 * Validates publication metadata including ISBN, dates, copyright, and classification codes.
 * Ensures ISBN is provided and dates follow logical order.
 *
 * Since book publication only requires schema validation (no domain checks),
 * this validator directly extends BaseValidator instead of AbstractBookValidator.
 */
@injectable()
export class PublishBookValidator extends BaseValidator<PublishBookDto> {
  protected readonly schema = Joi.object<PublishBookDto>({
    isbn: isbnSchema.required().messages({
      'any.required': 'ISBN is required to publish a book',
    }),

    publishedDate: Joi.date().max('now').optional().messages({
      'date.max': 'Published date cannot be in the future',
    }),

    copyright: Joi.string().max(100).optional().messages({
      'string.max': 'Copyright notice must be at most 100 characters',
    }),

    firstPublishedDate: Joi.date().max(Joi.ref('publishedDate')).optional().messages({
      'date.max': 'First published date cannot be after published date',
    }),

    edition: Joi.string().max(50).optional().messages({
      'string.max': 'Edition must be at most 50 characters',
    }),

    bisacCodes: Joi.array().items(Joi.string()).max(10).optional().messages({
      'array.max': 'Maximum 10 BISAC codes allowed',
    }),

    thema: Joi.array().items(Joi.string()).max(10).optional().messages({
      'array.max': 'Maximum 10 Thema codes allowed',
    }),
  });
}
