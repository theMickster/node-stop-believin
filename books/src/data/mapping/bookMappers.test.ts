import {
  TEST_DATE_START_OF_2024,
  TEST_USER_NAME,
  TEST_ISBN_13,
  TEST_DEWEY_DECIMAL,
} from '@tests/helpers/resuableConstants';
import { v4 as uuidv4 } from 'uuid';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';

import { mapBookToReadBookDto } from './bookMappers';

describe('mapBookToReadBookDto', () => {
  const baseBook: Book = {
    id: uuidv4(),
    bookId: uuidv4(),
    entityType: ENTITY_TYPES.BOOK,
    name: 'Test Book',
    authors: [
      {
        authorId: uuidv4(),
        firstName: 'John',
        lastName: 'Doe',
        order: 1,
      },
    ],
    createdAt: TEST_DATE_START_OF_2024,
    createdBy: TEST_USER_NAME,
    updatedAt: TEST_DATE_START_OF_2024,
    updatedBy: TEST_USER_NAME,
    isDeleted: false,
    version: 1,
  };

  describe('basic mapping', () => {
    it('should map basic book properties', () => {
      const result = mapBookToReadBookDto(baseBook);

      expect(result.id).toBe(baseBook.id);
      expect(result.name).toBe(baseBook.name);
      expect(result.authors).toHaveLength(1);
      expect(result.authors[0].firstName).toBe('John');
      expect(result.authors[0].lastName).toBe('Doe');
    });

    it('should not include publicationInfo when no publication data exists', () => {
      const result = mapBookToReadBookDto(baseBook);

      expect(result.publicationInfo).toBeUndefined();
    });

    it('should not include classificationInfo when no classification data exists', () => {
      const result = mapBookToReadBookDto(baseBook);

      expect(result.classificationInfo).toBeUndefined();
    });
  });

  describe('publication info mapping', () => {
    it('should map complete publication info for published book', () => {
      const publishedBook: Book = {
        ...baseBook,
        isbn: {
          isbn10: '1234567890',
          isbn13: TEST_ISBN_13,
        },
        publishedDate: new Date('2024-06-01'),
        firstPublishedDate: new Date('2023-01-01'),
        copyright: '© 2024 Publisher',
        edition: '2nd Edition',
        publisher: {
          name: 'Test Publisher',
          location: 'New York',
          website: 'https://publisher.com',
        },
      };

      const result = mapBookToReadBookDto(publishedBook);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.isbn).toEqual({
        isbn10: '1234567890',
        isbn13: TEST_ISBN_13,
      });
      expect(result.publicationInfo?.publishedDate).toBe('2024-06-01T00:00:00.000Z');
      expect(result.publicationInfo?.firstPublishedDate).toBe('2023-01-01T00:00:00.000Z');
      expect(result.publicationInfo?.copyright).toBe('© 2024 Publisher');
      expect(result.publicationInfo?.edition).toBe('2nd Edition');
      expect(result.publicationInfo?.isPublished).toBe(true);
      expect(result.publicationInfo?.publisher).toEqual({
        name: 'Test Publisher',
        location: 'New York',
        website: 'https://publisher.com',
      });
    });

    it('should set isPublished to true when publishedDate exists', () => {
      const publishedBook: Book = {
        ...baseBook,
        publishedDate: new Date('2024-06-01'),
      };

      const result = mapBookToReadBookDto(publishedBook);

      expect(result.publicationInfo?.isPublished).toBe(true);
    });

    it('should set isPublished to false when publishedDate does not exist', () => {
      const unpublishedBook: Book = {
        ...baseBook,
        isbn: {
          isbn13: TEST_ISBN_13,
        },
      };

      const result = mapBookToReadBookDto(unpublishedBook);

      expect(result.publicationInfo?.isPublished).toBe(false);
    });

    it('should include publicationInfo when only ISBN exists', () => {
      const bookWithIsbn: Book = {
        ...baseBook,
        isbn: {
          isbn13: TEST_ISBN_13,
        },
      };

      const result = mapBookToReadBookDto(bookWithIsbn);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.isbn).toEqual({
        isbn13: TEST_ISBN_13,
      });
      expect(result.publicationInfo?.isPublished).toBe(false);
    });

    it('should include publicationInfo when only publisher exists', () => {
      const bookWithPublisher: Book = {
        ...baseBook,
        publisher: {
          name: 'Test Publisher',
        },
      };

      const result = mapBookToReadBookDto(bookWithPublisher);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.publisher).toEqual({
        name: 'Test Publisher',
      });
      expect(result.publicationInfo?.isPublished).toBe(false);
    });

    it('should include publicationInfo when only edition exists', () => {
      const bookWithEdition: Book = {
        ...baseBook,
        edition: '1st Edition',
      };

      const result = mapBookToReadBookDto(bookWithEdition);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.edition).toBe('1st Edition');
      expect(result.publicationInfo?.isPublished).toBe(false);
    });

    it('should include publicationInfo when only copyright exists', () => {
      const bookWithCopyright: Book = {
        ...baseBook,
        copyright: '© 2024',
      };

      const result = mapBookToReadBookDto(bookWithCopyright);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.copyright).toBe('© 2024');
      expect(result.publicationInfo?.isPublished).toBe(false);
    });
  });

  describe('classification info mapping', () => {
    it('should map complete classification info', () => {
      const classifiedBook: Book = {
        ...baseBook,
        genres: ['Fiction', 'Mystery'],
        subjects: ['Crime', 'Detective'],
        bisacCodes: ['FIC022000', 'FIC022020'],
        thema: ['FH', 'FHD'],
        libraryClassification: {
          deweyDecimal: TEST_DEWEY_DECIMAL,
          libraryOfCongressNumber: 'PS3614.O3456',
          oclcNumber: '123456789',
        },
        ageRating: 'Adult',
        readingLevel: 'Advanced',
      };

      const result = mapBookToReadBookDto(classifiedBook);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.genres).toEqual(['Fiction', 'Mystery']);
      expect(result.classificationInfo?.subjects).toEqual(['Crime', 'Detective']);
      expect(result.classificationInfo?.bisacCodes).toEqual(['FIC022000', 'FIC022020']);
      expect(result.classificationInfo?.thema).toEqual(['FH', 'FHD']);
      expect(result.classificationInfo?.libraryClassification).toEqual({
        deweyDecimal: TEST_DEWEY_DECIMAL,
        libraryOfCongressNumber: 'PS3614.O3456',
        oclcNumber: '123456789',
      });
      expect(result.classificationInfo?.ageRating).toBe('Adult');
      expect(result.classificationInfo?.readingLevel).toBe('Advanced');
    });

    it('should include classificationInfo when only genres exist', () => {
      const bookWithGenres: Book = {
        ...baseBook,
        genres: ['Fiction'],
      };

      const result = mapBookToReadBookDto(bookWithGenres);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.genres).toEqual(['Fiction']);
    });

    it('should include classificationInfo when only subjects exist', () => {
      const bookWithSubjects: Book = {
        ...baseBook,
        subjects: ['Crime'],
      };

      const result = mapBookToReadBookDto(bookWithSubjects);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.subjects).toEqual(['Crime']);
    });

    it('should include classificationInfo when only BISAC codes exist', () => {
      const bookWithBisac: Book = {
        ...baseBook,
        bisacCodes: ['FIC022000'],
      };

      const result = mapBookToReadBookDto(bookWithBisac);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.bisacCodes).toEqual(['FIC022000']);
    });

    it('should include classificationInfo when only Thema exists', () => {
      const bookWithThema: Book = {
        ...baseBook,
        thema: ['FH'],
      };

      const result = mapBookToReadBookDto(bookWithThema);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.thema).toEqual(['FH']);
    });

    it('should include classificationInfo when only library classification exists', () => {
      const bookWithLibrary: Book = {
        ...baseBook,
        libraryClassification: {
          deweyDecimal: TEST_DEWEY_DECIMAL,
        },
      };

      const result = mapBookToReadBookDto(bookWithLibrary);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.libraryClassification).toEqual({
        deweyDecimal: TEST_DEWEY_DECIMAL,
      });
    });

    it('should include classificationInfo when only age rating exists', () => {
      const bookWithAge: Book = {
        ...baseBook,
        ageRating: 'Teen',
      };

      const result = mapBookToReadBookDto(bookWithAge);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.ageRating).toBe('Teen');
    });

    it('should include classificationInfo when only reading level exists', () => {
      const bookWithLevel: Book = {
        ...baseBook,
        readingLevel: 'Beginner',
      };

      const result = mapBookToReadBookDto(bookWithLevel);

      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.readingLevel).toBe('Beginner');
    });
  });

  describe('combined publication and classification info', () => {
    it('should map both publication and classification info when both exist', () => {
      const fullBook: Book = {
        ...baseBook,
        isbn: {
          isbn13: TEST_ISBN_13,
        },
        publishedDate: new Date('2024-06-01'),
        edition: '1st Edition',
        genres: ['Fiction'],
        subjects: ['Mystery'],
        ageRating: 'Adult',
      };

      const result = mapBookToReadBookDto(fullBook);

      expect(result.publicationInfo).toBeDefined();
      expect(result.publicationInfo?.isPublished).toBe(true);
      expect(result.classificationInfo).toBeDefined();
      expect(result.classificationInfo?.genres).toEqual(['Fiction']);
    });
  });
});
