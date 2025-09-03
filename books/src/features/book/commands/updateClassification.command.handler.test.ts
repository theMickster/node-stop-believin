import { mock, mockReset } from 'jest-mock-extended';

import { isCommandOk, isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { UpdateClassificationCommand } from './updateClassification.command';
import { UpdateClassificationCommandHandler } from './updateClassification.command.handler';


describe('UpdateClassificationCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  let sut: UpdateClassificationCommandHandler;

  const testBook: Book = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    bookId: '123e4567-e89b-12d3-a456-426614174000',
    entityType: ENTITY_TYPES.BOOK,
    name: 'Test Book',
    authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Doe', order: 1 }],
    libraryClassification: {
      deweyDecimal: '813.6',
      libraryOfCongressNumber: 'PZ7.OLD123',
      oclcNumber: '111111111',
    },
    createdAt: new Date('2024-01-01'),
    createdBy: 'test-user',
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'test-user',
    isDeleted: false,
    version: 1,
  };

  beforeEach(() => {
    mockReset(mockBookRepository);
    sut = new UpdateClassificationCommandHandler(mockBookRepository);
  });

  describe('handle', () => {
    it('should update all classification fields', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
        libraryOfCongressNumber: 'PR6068.O93',
        oclcNumber: '987654321',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: '823.914',
            libraryOfCongressNumber: 'PR6068.O93',
            oclcNumber: '987654321',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          deweyDecimal: '823.914',
          libraryOfCongressNumber: 'PR6068.O93',
          oclcNumber: '987654321',
        });
      }
    });

    it('should update only Dewey Decimal field', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: '823.914',
            libraryOfCongressNumber: 'PZ7.OLD123',
            oclcNumber: '111111111',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification?.deweyDecimal).toBe('823.914');
        expect(result.data.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
        expect(result.data.libraryClassification?.oclcNumber).toBe('111111111');
      }
    });

    it('should preserve existing fields when not provided', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: '999999999',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            deweyDecimal: '813.6',
            libraryOfCongressNumber: 'PZ7.OLD123',
            oclcNumber: '999999999',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification?.deweyDecimal).toBe('813.6');
        expect(result.data.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
        expect(result.data.libraryClassification?.oclcNumber).toBe('999999999');
      }
    });

    it('should clear field when null is provided', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: null as unknown as string,
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: {
            libraryOfCongressNumber: 'PZ7.OLD123',
            oclcNumber: '111111111',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification?.deweyDecimal).toBeUndefined();
        expect(result.data.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
      }
    });

    it('should clear all classification fields when all are null', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: null as unknown as string,
        libraryOfCongressNumber: null as unknown as string,
        oclcNumber: null as unknown as string,
      });

      const bookWithoutClassification = { ...testBook };
      delete bookWithoutClassification.libraryClassification;

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...bookWithoutClassification,
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toBeUndefined();
      }
    });

    it('should work with book that has no existing classification', async () => {
      const bookWithoutClassification = { ...testBook };
      delete bookWithoutClassification.libraryClassification;

      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(bookWithoutClassification));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...bookWithoutClassification,
          libraryClassification: {
            deweyDecimal: '813.6',
          },
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          deweyDecimal: '813.6',
        });
      }
    });

    it('should increment book version', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
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
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
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

    it('should return error when validation fails', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {});

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error when book not found', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
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
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
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

    it('should return error when update fails', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
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
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Failed to update classification');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error with invalid Dewey Decimal format', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '81.3',
      });

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('Dewey Decimal must be in format XXX.XX');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error with invalid OCLC number', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: 'ABC123',
      });

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('OCLC number must contain only digits');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });
});
