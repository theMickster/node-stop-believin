import { v4 as uuidv4 } from 'uuid';

import { isValidationSuccess, isValidationFailure } from '@libs/validation/validationResult.type';

import { CreateBookValidator } from './createBook.validator';

describe('CreateBookValidator', () => {
    let validator: CreateBookValidator;

    const validBook = {
      name: 'Test Book',
      authors: [
        {
          authorId: uuidv4(),
          firstName: 'John',
          lastName: 'Doe',
          order: 1,
        },
      ],
    };

    beforeEach(() => {
      validator = new CreateBookValidator();
    });

    it('should pass validation for a valid book object', async () => {
      const result = await validator.validate(validBook);
      expect(result.valid).toBe(true);
      expect(isValidationSuccess(result)).toBe(true);
    });

    it('should fail when book name is missing', async () => {
      const book = { ...validBook, name: '' };
      const result = await validator.validate(book);
      expect(result.valid).toBe(false);
      expect(isValidationFailure(result)).toBe(true);
      if (!result.valid) {
        expect(result.error.message).toContain('Book name is required');
      }
    });

    it('should fail when authors array is missing', async () => {
      const { authors: _authors, ...bookWithoutAuthors } = validBook;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validator.validate(bookWithoutAuthors as any);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Authors are required');
      }
    });

    it('should fail when authors array is empty', async () => {
      const book = { ...validBook, authors: [] };
      const result = await validator.validate(book);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('At least one author is required');
      }
    });

    it('should fail when authorId is not a valid UUID', async () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            authorId: 'not-a-uuid',
          },
        ],
      };
      const result = await validator.validate(book);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Author ID must be a valid GUID');
      }
    });

    it('should fail when author first name is missing', async () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            firstName: '',
          },
        ],
      };
      const result = await validator.validate(book);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('First name is required');
      }
    });

    it('should fail when author last name is too short', async () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            lastName: 'A',
          },
        ],
      };
      const result = await validator.validate(book);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Last name must be at least 2 characters');
      }
    });

    it('should pass with optional displayName and role fields', async () => {
      const book = {
        ...validBook,
        authors: [{ ...validBook.authors[0], displayName: 'Johnny', role: 'Author' as const }],
      };
      const result = await validator.validate(book);
      expect(result.valid).toBe(true);
    });

    it('should fail when role is invalid', async () => {
      const book = {
        ...validBook,
        authors: [{ ...validBook.authors[0], role: 'InvalidRole' }],
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validator.validate(book as any);
      expect(result.valid).toBe(false);
    });
  });