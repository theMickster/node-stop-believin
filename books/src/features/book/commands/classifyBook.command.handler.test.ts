import { buildMockExecutionContext } from '_test_/builders/executionContextMockBuilder';
import {
  expectCommandSuccess,
  expectValidationError,
  expectNotFoundError,
  expectDatabaseError,
} from '_test_/helpers/commandAssertions';
import { mock, mockReset } from 'jest-mock-extended';


import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { ClassifyBookCommand } from './classifyBook.command';
import { ClassifyBookCommandHandler } from './classifyBook.command.handler';


describe('ClassifyBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  let sut: ClassifyBookCommandHandler;
  const mockContext = buildMockExecutionContext().build();

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
    sut = new ClassifyBookCommandHandler(mockBookRepository);
  });

  describe('handle', () => {
    it('should classify book with all classification fields', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
        libraryOfCongressNumber: 'PZ7.R79835',
        oclcNumber: '123456789',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: '813.6',
            libraryOfCongressNumber: 'PZ7.R79835',
            oclcNumber: '123456789',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          deweyDecimal: '813.6',
          libraryOfCongressNumber: 'PZ7.R79835',
          oclcNumber: '123456789',
        });
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryClassification: {
            deweyDecimal: '813.6',
            libraryOfCongressNumber: 'PZ7.R79835',
            oclcNumber: '123456789',
          },
          version: 2,
        }),
      );
    });

    it('should classify book with only Dewey Decimal', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: '813.6',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          deweyDecimal: '813.6',
        });
      });
    });

    it('should classify book with only Library of Congress number', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        libraryOfCongressNumber: 'PZ7.R79835',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            libraryOfCongressNumber: 'PZ7.R79835',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          libraryOfCongressNumber: 'PZ7.R79835',
        });
      });
    });

    it('should classify book with only OCLC number', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: '123456789',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            oclcNumber: '123456789',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          oclcNumber: '123456789',
        });
      });
    });

    it('should increment book version', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: { deweyDecimal: '813.6' },
          version: 2,
        }),
      );

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          version: 2,
        }),
      );
    });

    it('should update book metadata', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk({ ...testBook, version: 2 }));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          updatedBy: 'test-user-id',
          updatedAt: expect.any(Date),
        }),
      );
    });

    it('should return error when validation fails', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {}, mockContext);

      const result = await sut.handle(command);

      expectValidationError(result, 'At least one classification field');
    });

    it('should return error when book not found', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoFail('Book not found', 404));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when repository returns no data', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when update fails', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoFail('Database error', 500));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Database error');
    });

    it('should return error when update returns no data', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      }, mockContext);

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Failed to classify book');
    });

    it('should return error with invalid Dewey Decimal format', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '81.3',
      }, mockContext);

      const result = await sut.handle(command);

      expectValidationError(result, 'Dewey Decimal must be in format XXX.XX');
    });

    it('should return error with invalid OCLC number', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: '123-456',
      }, mockContext);

      const result = await sut.handle(command);

      expectValidationError(result, 'OCLC number must contain only digits');
    });
  });
});
