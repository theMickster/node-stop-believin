import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { BookRepository } from '@data/repos/book.repository';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { UpdatePublicationCommandHandler } from './updatePublication.command.handler';
import { UpdatePublicationCommand } from './updatePublication.command';
import { ILogger } from '@libs/logging/logger.interface';
import { mock, mockReset } from 'jest-mock-extended';
import { isCommandOk, isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';

describe('UpdatePublicationCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  const mockLogger = mock<ILogger>();
  let sut: UpdatePublicationCommandHandler;

  const testBook: Book = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    bookId: '123e4567-e89b-12d3-a456-426614174000',
    entityType: ENTITY_TYPES.BOOK,
    name: 'Test Book',
    authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    isbn: { isbn13: '9781234567890' },
    publishedDate: new Date('2024-12-01'),
    firstPublishedDate: new Date('2024-12-01'),
    edition: '1st Edition',
    copyright: '© 2024 Test Publisher',
    createdAt: new Date('2024-01-01'),
    createdBy: 'test-user',
    updatedAt: new Date('2024-12-01'),
    updatedBy: 'test-user',
    isDeleted: false,
    version: 1,
  };

  beforeEach(() => {
    mockReset(mockBookRepository);
    mockReset(mockLogger);
    sut = new UpdatePublicationCommandHandler(mockBookRepository, mockLogger);
  });

  describe('handle', () => {
    it('should update ISBN', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9780987654321' },
        reason: 'Correcting ISBN due to data entry error',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn13: '9780987654321' },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn13: '9780987654321' });
      }
      expect(mockBookRepository.isbnExists).toHaveBeenCalledWith({ isbn13: '9780987654321' }, testBook.id);
    });

    it('should update copyright', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025 Updated Publisher',
        reason: 'Publisher name changed',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          copyright: '© 2025 Updated Publisher',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.copyright).toBe('© 2025 Updated Publisher');
      }
    });

    it('should update edition', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        edition: '2nd Edition',
        reason: 'Correcting edition information',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          edition: '2nd Edition',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.edition).toBe('2nd Edition');
      }
    });

    it('should update published date', async () => {
      const newDate = new Date('2025-01-20');
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        publishedDate: newDate,
        reason: 'Correcting publication date',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          publishedDate: newDate,
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.publishedDate).toEqual(newDate);
      }
    });

    it('should update multiple fields at once', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9780987654321' },
        copyright: '© 2025 New Publisher',
        edition: '2nd Edition',
        reason: 'Multiple corrections needed',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(false));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          isbn: { isbn13: '9780987654321' },
          copyright: '© 2025 New Publisher',
          edition: '2nd Edition',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.isbn).toEqual({ isbn13: '9780987654321' });
        expect(result.data.copyright).toBe('© 2025 New Publisher');
        expect(result.data.edition).toBe('2nd Edition');
      }
    });

    it('should increment book version', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025 Updated',
        reason: 'Copyright update required by publisher',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
        }),
      );
    });

    it('should update book metadata', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025 Updated',
        reason: 'Metadata update required',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: 'system',
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should log update for audit purposes', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025 Updated',
        reason: 'Copyright correction',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Publication information updated',
        expect.objectContaining({
          bookId: testBook.bookId,
          reason: 'Copyright correction',
          updatedBy: 'system',
        }),
      );
    });

    it('should return error when validation fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {} as any);

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error when book not found', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        reason: 'Copyright update needed',
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
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        reason: 'Copyright update needed',
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.BOOK_NOT_FOUND);
        expect(result.error.message).toBe('Book not found');
        expect(result.error.statusCode).toBe(HttpStatus.NOT_FOUND);
      }
    });

    it('should return error when book is not published', async () => {
      const unpublishedBook: Book = {
        ...testBook,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publishedDate: null as any,
      };

      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        reason: 'Copyright update needed',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(unpublishedBook));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('Cannot update publication information');
        expect(result.error.message).toContain('not been published yet');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error when ISBN check fails', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9780987654321' },
        reason: 'ISBN correction',
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

    it('should return error when ISBN already exists', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        isbn: { isbn13: '9780987654321' },
        reason: 'ISBN correction',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(true));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.ISBN_CONFLICT);
        expect(result.error.message).toContain('ISBN 9780987654321 is already assigned to another book');
        expect(result.error.statusCode).toBe(HttpStatus.CONFLICT);
      }
    });

    it('should return error when update fails', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        reason: 'Copyright correction needed',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
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
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        reason: 'Copyright correction needed',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Failed to update publication information');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error when reason is missing', async () => {
      const command = new UpdatePublicationCommand('123e4567-e89b-12d3-a456-426614174000', {
        copyright: '© 2025',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('Reason is required');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
