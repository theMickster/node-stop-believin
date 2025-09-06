import Joi from 'joi';

/**
 * Shared validation schema for Book Author objects
 *
 * This schema is reused across multiple book validators to ensure
 * consistent validation rules and eliminate duplication (DRY principle).
 *
 * Author roles follow a controlled vocabulary to ensure data consistency.
 */
export const BookAuthorSchema = Joi.object({
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
  displayName: Joi.string().optional().allow(''),
  role: Joi.string().valid('Author', 'CoAuthor', 'Editor', 'Translator', 'Illustrator').optional(),
  order: Joi.number().integer().min(1).required().messages({
    'number.base': 'Order must be a number',
    'number.min': 'Order must be at least 1',
    'any.required': 'Order is required',
  }),
}).required();

/**
 * Array validation for book authors
 * Ensures at least one author is provided with proper error messages
 */
export const BookAuthorsArraySchema = Joi.array().items(BookAuthorSchema).min(1).required().messages({
  'array.min': 'At least one author is required',
  'array.includesRequiredUnknowns': 'At least one author is required',
  'any.required': 'Authors are required',
  'array.base': 'Authors must be an array',
});
