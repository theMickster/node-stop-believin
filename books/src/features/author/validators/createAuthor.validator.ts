import Joi from 'joi';

export const CreateAuthorValidator = Joi.object({
  firstName: Joi.string().min(2).required().messages({
    'string.min': 'First name must be at least 2 characters',
    'string.empty': 'First name is required',
  }),
  middleName: Joi.string().optional().allow(''),
  lastName: Joi.string().min(2).required().messages({
    'string.min': 'Last name must be at least 2 characters',
    'string.empty': 'Last name is required',
  }),
  displayName: Joi.string().min(2).required().messages({
    'string.min': 'Display name must be at least 2 characters',
    'string.empty': 'Display name is required',
  }),
  pseudonyms: Joi.array().items(Joi.string()).optional(),
  suffix: Joi.string().optional().allow(''),
  shortBio: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Short bio must not exceed 500 characters',
  }),
  longBio: Joi.string().optional().allow(''),
  genres: Joi.array().items(Joi.string()).min(1).required().messages({
    'array.min': 'At least one genre is required',
    'any.required': 'Genres are required',
    'array.base': 'Genres must be an array',
  }),
  email: Joi.string().email().optional().allow('').messages({
    'string.email': 'Email must be a valid email address',
  }),
  website: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Website must be a valid URL',
  }),
  socialMedia: Joi.object({
    twitter: Joi.string().optional().allow(''),
    instagram: Joi.string().optional().allow(''),
    facebook: Joi.string().optional().allow(''),
    linkedin: Joi.string().optional().allow(''),
    goodreads: Joi.string().optional().allow(''),
    amazonAuthor: Joi.string().optional().allow(''),
  }).optional(),
  profilePhotoUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Profile photo URL must be a valid URL',
  }),
  bannerImageUrl: Joi.string().uri().optional().allow('').messages({
    'string.uri': 'Banner image URL must be a valid URL',
  }),
  photoGallery: Joi.array().items(Joi.string().uri()).optional(),
  status: Joi.string().valid('Active', 'Retired', 'Deceased', 'Inactive').required().messages({
    'any.only': 'Status must be one of: Active, Retired, Deceased, Inactive',
    'any.required': 'Status is required',
  }),
  isVerified: Joi.boolean().required().messages({
    'any.required': 'Verification status is required',
  }),
});
