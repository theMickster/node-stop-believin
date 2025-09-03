import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';

/**
 * Base test book fixture - unpublished, unclassified
 */
export const createBaseBook = (overrides?: Partial<Book>): Book => ({
  id: '123e4567-e89b-12d3-a456-426614174000',
  bookId: '123e4567-e89b-12d3-a456-426614174000',
  entityType: ENTITY_TYPES.BOOK,
  name: 'Test Book',
  authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Doe', order: 1 }],
  createdAt: new Date('2024-01-01'),
  createdBy: 'test-user',
  updatedAt: new Date('2024-01-01'),
  updatedBy: 'test-user',
  isDeleted: false,
  version: 1,
  ...overrides,
});

/**
 * Published book fixture
 */
export const createPublishedBook = (overrides?: Partial<Book>): Book =>
  createBaseBook({
    isbn: { isbn13: '9781234567890' },
    publishedDate: new Date('2024-12-01'),
    firstPublishedDate: new Date('2024-12-01'),
    edition: '1st Edition',
    copyright: '© 2024 Test Publisher',
    ...overrides,
  });

/**
 * Classified book fixture
 */
export const createClassifiedBook = (overrides?: Partial<Book>): Book =>
  createBaseBook({
    libraryClassification: {
      deweyDecimal: '813.6',
      libraryOfCongressNumber: 'PZ7.R79835',
      oclcNumber: '123456789',
    },
    ...overrides,
  });

/**
 * Fully populated book fixture (published + classified)
 */
export const createFullBook = (overrides?: Partial<Book>): Book =>
  createBaseBook({
    isbn: { isbn13: '9781234567890' },
    publishedDate: new Date('2024-12-01'),
    firstPublishedDate: new Date('2024-12-01'),
    edition: '1st Edition',
    copyright: '© 2024 Test Publisher',
    libraryClassification: {
      deweyDecimal: '813.6',
      libraryOfCongressNumber: 'PZ7.R79835',
      oclcNumber: '123456789',
    },
    bisacCodes: ['JUV037000', 'FIC009000'],
    thema: ['YFB', 'YFD'],
    ...overrides,
  });

/**
 * Create a book with incremented version
 */
export const withVersion = (book: Book, version: number): Book => ({
  ...book,
  version,
});

/**
 * Create a book with updated metadata
 */
export const withUpdatedMetadata = (book: Book, updatedBy = 'system'): Book => ({
  ...book,
  updatedBy,
  updatedAt: new Date('2024-12-15T10:30:00Z'),
});
