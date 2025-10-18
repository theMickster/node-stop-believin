import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { BookRepository } from '@data/repos/book.repository';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { PublishBookCommandHandler } from './publishBook.command.handler';
import { PublishBookCommand } from './publishBook.command';
import { mock, mockReset } from 'jest-mock-extended';
import { isCommandOk, isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';

describe('PublishBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  let sut: PublishBookCommandHandler;

  const testBook: Book = {
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
  };

  beforeEach(() => {
    mockReset(mockBookRepository);
    sut = new PublishBookCommandHandler(mockBookRepository);
  });

  describe('handle', () => {
    it('should publish book with all fields', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
        publishedDate: new Date('2025-01-15'),
        firstPublishedDate: new Date('2025-01-15'),
        copyright: '© 2025 Test Publisher',
        edition: '2nd Edition',
        bisacCodes: ['JUV037000', 'FIC009000'],
        thema: ['YFB', 'YFD'],
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn13: '9781234567890' },
          publishedDate: new Date('2025-01-15'),
          firstPublishedDate: new Date('2025-01-15'),
          copyright: '© 2025 Test Publisher',
          edition: '2nd Edition',
          bisacCodes: ['JUV037000', 'FIC009000'],
          thema: ['YFB', 'YFD'],
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn13: '9781234567890' });
        expect(result.data.publishedDate).toEqual(new Date('2025-01-15'));
        expect(result.data.copyright).toBe('© 2025 Test Publisher');
        expect(result.data.edition).toBe('2nd Edition');
        expect(result.data.bisacCodes).toEqual(['JUV037000', 'FIC009000']);
        expect(result.data.thema).toEqual(['YFB', 'YFD']);
      }
    });

    it('should publish book with only required ISBN field', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn13: '9781234567890' },
          publishedDate: expect.any(Date),
          firstPublishedDate: expect.any(Date),
          edition: '1st Edition',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn13: '9781234567890' });
        expect(result.data.edition).toBe('1st Edition');
      }
    });

    it('should use current date when publishedDate not provided', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

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
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
        publishedDate,
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          publishedDate,
          firstPublishedDate: publishedDate,
        }),
      );
    });

    it('should default to 1st Edition when edition not provided', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          edition: '1st Edition',
        }),
      );
    });

    it('should publish with ISBN-10', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn10: '1234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn10: '1234567890' },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn10: '1234567890' });
      }
    });

    it('should publish with both ISBN-10 and ISBN-13', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn10: '1234567890', isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn10: '1234567890', isbn13: '9781234567890' },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn10: '1234567890', isbn13: '9781234567890' });
      }
    });

    it('should increment book version', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
        }),
      );
    });

    it('should update book metadata', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: 'system',
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should return error when validation fails', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {} as any);

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error when book not found', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoFail('Book not found', 404));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.BOOK_NOT_FOUND);
        expect(result.error.message).toBe('Book not found');
        expect(result.error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return error when repository returns no data', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.BOOK_NOT_FOUND);
        expect(result.error.message).toBe('Book not found');
        expect(result.error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return error when book is already published', async () => {
      const publishedBook = {
        ...testBook,
        publishedDate: new Date('2024-12-01'),
      };

      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(publishedBook));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.BOOK_ALREADY_EXISTS);
        expect(result.error.message).toContain('Book is already published');
        expect(result.error.message).toContain('Use update-publication endpoint');
        expect(result.error.statusCode).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should return error when ISBN check fails', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoFail('Database error', 500));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Database error');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error when ISBN already exists with ISBN-13', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(true));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.ISBN_CONFLICT);
        expect(result.error.message).toContain('ISBN 9781234567890 is already assigned to another book');
        expect(result.error.statusCode).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should return error when ISBN already exists with ISBN-10', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn10: '1234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(true));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.ISBN_CONFLICT);
        expect(result.error.message).toContain('ISBN 1234567890 is already assigned to another book');
        expect(result.error.statusCode).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should return error when update fails', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoFail('Database error', 500));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Database error');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error when update returns no data', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9781234567890' },
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Failed to publish book');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error with invalid ISBN-13 format', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '978123456789' },
      });

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('ISBN-13 must be exactly 13 digits');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error with invalid ISBN-10 format', async () => {
      const command = new PublishBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn10: '123456789' },
      });

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('ISBN-10 must be exactly 10 digits');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
