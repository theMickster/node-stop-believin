import { createBaseBook, withVersion } from '@fixtures/book.fixtures';
import { buildBookRepoMock } from '@tests/builders/bookRepositoryMockBuilder';
import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import {
  expectCommandSuccess,
  expectValidationError,
  expectCommandError,
  expectNotFoundError,
  expectDatabaseError,
  expectConflictError,
} from '@tests/helpers/commandAssertions';
import {
  TEST_ISBN_13,
  TEST_USER_ID,
  ERROR_BOOK_NOT_FOUND,
  ERROR_DATABASE_ERROR,
} from '@tests/helpers/resuableConstants';
import { mock, mockReset } from 'jest-mock-extended';

import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import { BookRepository } from '@data/repos/book.repository';

import { PublishBookCommand } from './publishBook.command';
import { PublishBookCommandHandler } from './publishBook.command.handler';

describe('PublishBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  let sut: PublishBookCommandHandler;
  const mockContext = buildMockExecutionContext().build();

  const testBook = createBaseBook();

  beforeEach(() => {
    mockReset(mockBookRepository);
    sut = new PublishBookCommandHandler(mockBookRepository);
  });

  describe('handle - success scenarios', () => {
    it('should publish book with all fields', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
          publishedDate: new Date('2025-01-15'),
          firstPublishedDate: new Date('2025-01-15'),
          copyright: '© 2025 Test Publisher',
          edition: '2nd Edition',
          bisacCodes: ['JUV037000', 'FIC009000'],
          thema: ['YFB', 'YFD'],
        },
        mockContext,
      );

      const updatedBook = withVersion(
        {
          ...testBook,
          isbn: { isbn13: TEST_ISBN_13 },
          publishedDate: new Date('2025-01-15'),
          firstPublishedDate: new Date('2025-01-15'),
          copyright: '© 2025 Test Publisher',
          edition: '2nd Edition',
          bisacCodes: ['JUV037000', 'FIC009000'],
          thema: ['YFB', 'YFD'],
        },
        2,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, updatedBook);

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn13: TEST_ISBN_13 });
        expect(data.publishedDate).toEqual(new Date('2025-01-15'));
        expect(data.copyright).toBe('© 2025 Test Publisher');
        expect(data.edition).toBe('2nd Edition');
        expect(data.bisacCodes).toEqual(['JUV037000', 'FIC009000']);
        expect(data.thema).toEqual(['YFB', 'YFD']);
      });
    });

    it('should publish book with only required ISBN field', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      const updatedBook = withVersion(
        {
          ...testBook,
          isbn: { isbn13: TEST_ISBN_13 },
          publishedDate: expect.any(Date),
          firstPublishedDate: expect.any(Date),
          edition: '1st Edition',
        },
        2,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, updatedBook);

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn13: TEST_ISBN_13 });
        expect(data.edition).toBe('1st Edition');
      });
    });

    it('should use current date when publishedDate not provided', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, withVersion(testBook, 2));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedDate: expect.any(Date),
          firstPublishedDate: expect.any(Date),
        }),
      );
    });

    it('should use publishedDate for firstPublishedDate when not provided', async () => {
      const publishedDate = new Date('2025-01-15');
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
          publishedDate,
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, withVersion(testBook, 2));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedDate,
          firstPublishedDate: publishedDate,
        }),
      );
    });

    it('should default to 1st Edition when edition not provided', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, withVersion(testBook, 2));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          edition: '1st Edition',
        }),
      );
    });

    it('should publish with ISBN-10', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn10: '1234567890' },
        },
        mockContext,
      );

      const updatedBook = withVersion(
        {
          ...testBook,
          isbn: { isbn10: '1234567890' },
        },
        2,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, updatedBook);

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn10: '1234567890' });
      });
    });

    it('should publish with both ISBN-10 and ISBN-13', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn10: '1234567890', isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      const updatedBook = withVersion(
        {
          ...testBook,
          isbn: { isbn10: '1234567890', isbn13: TEST_ISBN_13 },
        },
        2,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, updatedBook);

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn10: '1234567890', isbn13: TEST_ISBN_13 });
      });
    });

    it('should increment book version', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, withVersion(testBook, 2));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
        }),
      );
    });

    it('should update book metadata', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).setupHappyPath(testBook, withVersion(testBook, 2));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: TEST_USER_ID,
          updatedAt: expect.any(Date),
        }),
      );
    });
  });

  describe('handle - validation errors', () => {
    it('should return error when validation fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const command = new PublishBookCommand(testBook.bookId, {} as any, mockContext);

      const result = await sut.handle(command);

      expectValidationError(result);
    });

    it('should return error with invalid ISBN-13 format', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: '978123456789' },
        },
        mockContext,
      );

      const result = await sut.handle(command);

      expectValidationError(result, 'ISBN-13 must be exactly 13 digits');
    });

    it('should return error with invalid ISBN-10 format', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn10: '123456789' },
        },
        mockContext,
      );

      const result = await sut.handle(command);

      expectValidationError(result, 'ISBN-10 must be exactly 10 digits');
    });
  });

  describe('handle - business logic errors', () => {
    it('should return error when book is already published', async () => {
      const publishedBook = createBaseBook({
        publishedDate: new Date('2024-12-01'),
      });

      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).getByIdReturns(publishedBook);

      const result = await sut.handle(command);

      expectCommandError(result, ErrorCodes.BOOK_ALREADY_EXISTS, HttpStatus.CONFLICT, [
        'Book is already published',
        'Use update-publication endpoint',
      ]);
    });

    it('should return error when ISBN already exists with ISBN-13', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn13: TEST_ISBN_13 },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).getByIdReturns(testBook).isbnExistsReturns(true);

      const result = await sut.handle(command);

      expectConflictError(result, ['ISBN 9781234567890 is already assigned to another book']);
    });

    it('should return error when ISBN already exists with ISBN-10', async () => {
      const command = new PublishBookCommand(
        testBook.bookId,
        {
          isbn: { isbn10: '1234567890' },
        },
        mockContext,
      );

      buildBookRepoMock(mockBookRepository).getByIdReturns(testBook).isbnExistsReturns(true);

      const result = await sut.handle(command);

      expectConflictError(result, ['ISBN 1234567890 is already assigned to another book']);
    });
  });

  describe('handle - repository errors', () => {
    const validCommand = new PublishBookCommand(
      testBook.bookId,
      {
        isbn: { isbn13: TEST_ISBN_13 },
      },
      mockContext,
    );

    it('should return error when book not found', async () => {
      buildBookRepoMock(mockBookRepository).getByIdFails(ERROR_BOOK_NOT_FOUND, HttpStatus.NOT_FOUND);

      const result = await sut.handle(validCommand);

      expectNotFoundError(result, ERROR_BOOK_NOT_FOUND);
    });

    it('should return error when repository returns no data', async () => {
      buildBookRepoMock(mockBookRepository).getByIdReturnsNull();

      const result = await sut.handle(validCommand);

      expectNotFoundError(result, ERROR_BOOK_NOT_FOUND);
    });

    it('should return error when ISBN check fails', async () => {
      buildBookRepoMock(mockBookRepository)
        .getByIdReturns(testBook)
        .isbnExistsFails(ERROR_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);

      const result = await sut.handle(validCommand);

      expectDatabaseError(result, ERROR_DATABASE_ERROR);
    });

    it('should return error when update fails', async () => {
      buildBookRepoMock(mockBookRepository)
        .getByIdReturns(testBook)
        .isbnExistsReturns(false)
        .updateFails(ERROR_DATABASE_ERROR, HttpStatus.INTERNAL_SERVER_ERROR);

      const result = await sut.handle(validCommand);

      expectDatabaseError(result, ERROR_DATABASE_ERROR);
    });

    it('should return error when update returns no data', async () => {
      buildBookRepoMock(mockBookRepository).getByIdReturns(testBook).isbnExistsReturns(false).updateReturnsNull();

      const result = await sut.handle(validCommand);

      expectDatabaseError(result, 'Failed to publish book');
    });
  });
});
