import Joi from 'joi';

export const CreateBookValidator = Joi.object({
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
      'any.required': 'Authors are required',
    }),
});
