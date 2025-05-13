import { CreateBookValidator } from './createBook.validator'; 
import { v4 as uuidv4 } from 'uuid';

describe('CreateBookValidator', () => {
    const validBook = {
      name: 'Test Book',
      authors: [
        {
          authorId: uuidv4(),
          firstName: 'John',
          lastName: 'Doe',
        },
      ],
    };
  
    it('should pass validation for a valid book object', () => {
      const { error } = CreateBookValidator.validate(validBook);
      expect(error).toBeUndefined();
    });
  
    it('should fail when book name is missing', () => {
      const book = { ...validBook, name: '' };
      const { error } = CreateBookValidator.validate(book);
      expect(error?.details[0].message).toBe('Book name is required');
    });
  
    it('should fail when authors array is missing', () => {
      const { authors, ...bookWithoutAuthors } = validBook;
      const { error } = CreateBookValidator.validate(bookWithoutAuthors);
      expect(error?.details[0].message).toBe('Authors are required');
    });
  
    it('should fail when authors array is empty', () => {
      const book = { ...validBook, authors: [] };
      const { error } = CreateBookValidator.validate(book);
      expect(error?.details[0].message).toBe('At least one author is required');
    }); 
  
    it('should fail when authorId is not a valid UUID', () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            authorId: 'not-a-uuid',
          },
        ],
      };
      const { error } = CreateBookValidator.validate(book);
      expect(error?.details[0].message).toBe('Author ID must be a valid GUID');
    });
  
    it('should fail when author first name is missing', () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            firstName: '',
          },
        ],
      };
      const { error } = CreateBookValidator.validate(book);
      expect(error?.details[0].message).toBe('First name is required');
    });
  
    it('should fail when author last name is too short', () => {
      const book = {
        ...validBook,
        authors: [
          {
            ...validBook.authors[0],
            lastName: 'A',
          },
        ],
      };
      const { error } = CreateBookValidator.validate(book);
      expect(error?.details[0].message).toBe('Last name must be at least 2 characters');
    });
  });