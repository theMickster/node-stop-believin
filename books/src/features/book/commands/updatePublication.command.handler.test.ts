import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import {
  expectCommandSuccess,
  expectValidationError,
  expectNotFoundError,
  expectDatabaseError,
  expectConflictError,
} from '@tests/helpers/commandAssertions';
import {
  TEST_UUID,
  TEST_USER_ID,
  TEST_USER_NAME,
  TEST_DATE_START_OF_2024,
  TEST_ISBN_13,
  ERROR_BOOK_NOT_FOUND,
  ERROR_DATABASE_ERROR,
} from '@tests/helpers/resuableConstants';
import { mock, mockReset } from 'jest-mock-extended';

import { ILogger } from '@libs/logging/logger.interface';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { UpdatePublicationCommand } from './updatePublication.command';
import { UpdatePublicationCommandHandler } from './updatePublication.command.handler';

describe('UpdatePublicationCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  const mockLogger = mock<ILogger>();
  let sut: UpdatePublicationCommandHandler;
  const mockContext = buildMockExecutionContext().build();

  const testBook: Book = {
    id: TEST_UUID,
    bookId: TEST_UUID,
    entityType: ENTITY_TYPES.BOOK,
    name: 'Test Book',
    authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    isbn: { isbn13: TEST_ISBN_13 },
    publishedDate: new Date('2024-12-01'),
    firstPublishedDate: new Date('2024-12-01'),
    edition: '1st Edition',
    copyright: '© 2024 Test Publisher',
    createdAt: TEST_DATE_START_OF_2024,
    createdBy: TEST_USER_NAME,
    updatedAt: new Date('2024-12-01'),
    updatedBy: TEST_USER_NAME,
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
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          isbn: { isbn13: '9780987654321' },
          reason: 'Correcting ISBN due to data entry error',
        },
        mockContext,
      );

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

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn13: '9780987654321' });
      });
      expect(mockBookRepository.isbnExists).toHaveBeenCalledWith({ isbn13: '9780987654321' }, testBook.id);
    });

    it('should update copyright', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025 Updated Publisher',
          reason: 'Publisher name changed',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          copyright: '© 2025 Updated Publisher',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.copyright).toBe('© 2025 Updated Publisher');
      });
    });

    it('should update edition', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          edition: '2nd Edition',
          reason: 'Correcting edition information',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          edition: '2nd Edition',
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.edition).toBe('2nd Edition');
      });
    });

    it('should update published date', async () => {
      const newDate = new Date('2025-01-20');
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          publishedDate: newDate,
          reason: 'Correcting publication date',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          publishedDate: newDate,
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.publishedDate).toEqual(newDate);
      });
    });

    it('should update multiple fields at once', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          isbn: { isbn13: '9780987654321' },
          copyright: '© 2025 New Publisher',
          edition: '2nd Edition',
          reason: 'Multiple corrections needed',
        },
        mockContext,
      );

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

      expectCommandSuccess(result, (data) => {
        expect(data.isbn).toEqual({ isbn13: '9780987654321' });
        expect(data.copyright).toBe('© 2025 New Publisher');
        expect(data.edition).toBe('2nd Edition');
      });
    });

    it('should increment book version', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025 Updated',
          reason: 'Copyright update required by publisher',
        },
        mockContext,
      );

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
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025 Updated',
          reason: 'Metadata update required',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: TEST_USER_ID,
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should log update for audit purposes', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025 Updated',
          reason: 'Copyright correction',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockLogger.info).toHaveBeenCalledWith(
        'Publication information updated',
        expect.objectContaining({
          bookId: testBook.bookId,
          reason: 'Copyright correction',
          updatedBy: TEST_USER_ID,
        }),
      );
    });

    it('should return error when validation fails', async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const command = new UpdatePublicationCommand(TEST_UUID, {} as any, mockContext);

      const result = await sut.handle(command);

      expectValidationError(result);
    });

    it('should return error when book not found', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          reason: 'Copyright update needed',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoFail(ERROR_BOOK_NOT_FOUND, 404));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when repository returns no data', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          reason: 'Copyright update needed',
        },
        mockContext,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when book is not published', async () => {
      const unpublishedBook: Book = {
        ...testBook,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        publishedDate: null as any,
      };

      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          reason: 'Copyright update needed',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(unpublishedBook));

      const result = await sut.handle(command);

      expectValidationError(result, ['Cannot update publication information', 'not been published yet']);
    });

    it('should return error when ISBN check fails', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          isbn: { isbn13: '9780987654321' },
          reason: 'ISBN correction',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoFail(ERROR_DATABASE_ERROR, 500));

      const result = await sut.handle(command);

      expectDatabaseError(result, ERROR_DATABASE_ERROR);
    });

    it('should return error when ISBN already exists', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          isbn: { isbn13: '9780987654321' },
          reason: 'ISBN correction',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.isbnExists.mockResolvedValue(repoOk(true));

      const result = await sut.handle(command);

      expectConflictError(result, 'ISBN 9780987654321 is already assigned to another book');
    });

    it('should return error when update fails', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          reason: 'Copyright correction needed',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoFail(ERROR_DATABASE_ERROR, 500));

      const result = await sut.handle(command);

      expectDatabaseError(result, ERROR_DATABASE_ERROR);
    });

    it('should return error when update returns no data', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          reason: 'Copyright correction needed',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Failed to update publication information');
    });

    it('should return error when reason is missing', async () => {
      const command = new UpdatePublicationCommand(
        TEST_UUID,
        {
          copyright: '© 2025',
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
        mockContext,
      );

      const result = await sut.handle(command);

      expectValidationError(result, 'Reason is required');
    });
  });
});
