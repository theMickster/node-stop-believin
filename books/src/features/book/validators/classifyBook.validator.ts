import { injectable } from 'inversify';
import Joi from 'joi';

import { BaseValidator } from '@libs/validation/base.validator';

import { ClassifyBookDto } from '../models/classifyBookDto';

/**
 * Validator for classifying a book with library classification systems
 *
 * Validates Dewey Decimal, Library of Congress, and OCLC numbers.
 * Requires at least one classification field to be provided.
 *
 * Since book classification only requires schema validation (no domain checks),
 * this validator directly extends BaseValidator instead of AbstractBookValidator.
 */
@injectable()
export class ClassifyBookValidator extends BaseValidator<ClassifyBookDto> {
  protected readonly schema = Joi.object<ClassifyBookDto>({
    deweyDecimal: Joi.string()
      .pattern(/^\d{3}(\.\d+)?$/)
      .optional()
      .messages({
        'string.pattern.base': 'Dewey Decimal must be in format XXX.XX (e.g., 813.6)',
      }),

    libraryOfCongressNumber: Joi.string().max(50).optional().messages({
      'string.max': 'Library of Congress number must be at most 50 characters',
    }),

    oclcNumber: Joi.string().pattern(/^\d+$/).optional().messages({
      'string.pattern.base': 'OCLC number must contain only digits',
    }),
  })
    .or('deweyDecimal', 'libraryOfCongressNumber', 'oclcNumber')
    .messages({
      'object.missing':
        'At least one classification field (deweyDecimal, libraryOfCongressNumber, or oclcNumber) must be provided',
    });
}
