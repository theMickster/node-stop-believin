import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import {
  expectCommandSuccess,
  expectValidationError,
  expectNotFoundError,
  expectDatabaseError,
} from '@tests/helpers/commandAssertions';
import {
  TEST_UUID,
  TEST_USER_NAME,
  TEST_DATE_START_OF_2024,
  TEST_DEWEY_DECIMAL,
  TEST_LIBRARY_OF_CONGRESS,
  TEST_OCLC_NUMBER,
} from '@tests/helpers/resuableConstants';
import { mock, mockReset } from 'jest-mock-extended';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { ClassifyBookValidator } from '../validators/classifyBook.validator';

import { ClassifyBookCommand } from './classifyBook.command';
import { ClassifyBookCommandHandler } from './classifyBook.command.handler';

describe('ClassifyBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  const mockValidator = mock<ClassifyBookValidator>();
  let sut: ClassifyBookCommandHandler;
  const mockContext = buildMockExecutionContext().build();

  const testBook: Book = {
    id: TEST_UUID,
    bookId: TEST_UUID,
    entityType: ENTITY_TYPES.BOOK,
    name: 'Test Book',
    authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    createdAt: TEST_DATE_START_OF_2024,
    createdBy: TEST_USER_NAME,
    updatedAt: TEST_DATE_START_OF_2024,
    updatedBy: TEST_USER_NAME,
    isDeleted: false,
    version: 1,
  };

  beforeEach(() => {
    mockReset(mockBookRepository);
    mockReset(mockValidator);
    // Default to valid - override in individual tests for validation failures
    mockValidator.validate.mockResolvedValue({ valid: true });
    sut = new ClassifyBookCommandHandler(mockBookRepository, mockValidator);
  });

  describe('handle', () => {
    it('should classify book with all classification fields', async () => {
      const command = new ClassifyBookCommand(
        TEST_UUID,
        {
          deweyDecimal: TEST_DEWEY_DECIMAL,
          libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
          oclcNumber: TEST_OCLC_NUMBER,
        },
        mockContext,
      );

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: TEST_DEWEY_DECIMAL,
            libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
            oclcNumber: TEST_OCLC_NUMBER,
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          deweyDecimal: TEST_DEWEY_DECIMAL,
          libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
          oclcNumber: TEST_OCLC_NUMBER,
        });
      });
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          libraryClassification: {
            deweyDecimal: TEST_DEWEY_DECIMAL,
            libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
            oclcNumber: TEST_OCLC_NUMBER,
          },
          version: 2,
        }),
      );
    });

    it('should classify book with only Dewey Decimal', async () => {
      const command = new ClassifyBookCommand(
        TEST_UUID,
        {
          deweyDecimal: TEST_DEWEY_DECIMAL,
        },
        mockContext,
      );

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: TEST_DEWEY_DECIMAL,
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          deweyDecimal: TEST_DEWEY_DECIMAL,
        });
      });
    });

    it('should classify book with only Library of Congress number', async () => {
      const command = new ClassifyBookCommand(
        TEST_UUID,
        {
          libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          libraryOfCongressNumber: TEST_LIBRARY_OF_CONGRESS,
        });
      });
    });

    it('should classify book with only OCLC number', async () => {
      const command = new ClassifyBookCommand(
        TEST_UUID,
        {
          oclcNumber: TEST_OCLC_NUMBER,
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            oclcNumber: TEST_OCLC_NUMBER,
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data.libraryClassification).toEqual({
          oclcNumber: TEST_OCLC_NUMBER,
        });
      });
    });

    it('should increment book version', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

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
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

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

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: At least one classification field (deweyDecimal, libraryOfCongressNumber, or oclcNumber) must be provided'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'At least one classification field');
    });

    it('should return error when book not found', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoFail('Book not found', HttpStatus.NOT_FOUND));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when repository returns no data', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectNotFoundError(result);
    });

    it('should return error when update fails', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoFail('Database error', HttpStatus.INTERNAL_SERVER_ERROR));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Database error');
    });

    it('should return error when update returns no data', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '813.6',
        },
        mockContext,
      );

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Failed to classify book');
    });

    it('should return error with invalid Dewey Decimal format', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          deweyDecimal: '81.3',
        },
        mockContext,
      );

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Dewey Decimal must be in format XXX.XX (e.g., 813.6)'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Dewey Decimal must be in format XXX.XX');
    });

    it('should return error with invalid OCLC number', async () => {
      const command = new ClassifyBookCommand(
        '123e4567-e89b-12d3-a456-426614174000',
        {
          oclcNumber: '123-456',
        },
        mockContext,
      );

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: OCLC number must contain only digits'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'OCLC number must contain only digits');
    });
  });
});
