import Joi from 'joi';
import { UpdateClassificationDto } from '../models/updateClassificationDto';

export const UpdateClassificationValidator = Joi.object<UpdateClassificationDto>({
  deweyDecimal: Joi.string()
    .pattern(/^\d{3}(\.\d+)?$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'Dewey Decimal must be in format XXX.XX (e.g., 813.6)',
    }),

  libraryOfCongressNumber: Joi.string().max(50).optional().allow(null).messages({
    'string.max': 'Library of Congress number must be at most 50 characters',
  }),

  oclcNumber: Joi.string()
    .pattern(/^\d+$/)
    .optional()
    .allow(null)
    .messages({
      'string.pattern.base': 'OCLC number must contain only digits',
    }),
}).or('deweyDecimal', 'libraryOfCongressNumber', 'oclcNumber').messages({
  'object.missing': 'At least one classification field must be provided',
});
