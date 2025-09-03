import Joi from 'joi';

import { UpdatePublicationDto } from '../models/updatePublicationDto';

const isbnSchema = Joi.object({
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

export const UpdatePublicationValidator = Joi.object<UpdatePublicationDto>({
  isbn: isbnSchema.optional(),

  publishedDate: Joi.date().max('now').optional().messages({
    'date.max': 'Published date cannot be in the future',
  }),

  copyright: Joi.string().max(100).optional().messages({
    'string.max': 'Copyright notice must be at most 100 characters',
  }),

  edition: Joi.string().max(50).optional().messages({
    'string.max': 'Edition must be at most 50 characters',
  }),

  reason: Joi.string().min(10).max(500).required().messages({
    'string.min': 'Reason must be at least 10 characters to provide meaningful context',
    'string.max': 'Reason must be at most 500 characters',
    'any.required': 'Reason is required when updating publication information',
  }),
});
