import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { BookRepository } from '@data/repos/bookRepository';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { UpdateClassificationCommandHandler } from './updateClassification.command.handler';
import { UpdateClassificationCommand } from './updateClassification.command';
import { mock, mockReset } from 'jest-mock-extended';

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

      expect(result.libraryClassification).toEqual({
        deweyDecimal: '823.914',
        libraryOfCongressNumber: 'PR6068.O93',
        oclcNumber: '987654321',
      });
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

      expect(result.libraryClassification?.deweyDecimal).toBe('823.914');
      expect(result.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
      expect(result.libraryClassification?.oclcNumber).toBe('111111111');
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

      expect(result.libraryClassification?.deweyDecimal).toBe('813.6');
      expect(result.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
      expect(result.libraryClassification?.oclcNumber).toBe('999999999');
    });

    it('should clear field when null is provided', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: null,
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

      expect(result.libraryClassification?.deweyDecimal).toBeUndefined();
      expect(result.libraryClassification?.libraryOfCongressNumber).toBe('PZ7.OLD123');
    });

    it('should clear all classification fields when all are null', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: null,
        libraryOfCongressNumber: null,
        oclcNumber: null,
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(
        repoOk({
          ...testBook,
          libraryClassification: undefined,
          version: 2,
        }),
      );

      const result = await sut.handle(command);

      expect(result.libraryClassification).toBeUndefined();
    });

    it('should work with book that has no existing classification', async () => {
      const bookWithoutClassification = {
        ...testBook,
        libraryClassification: undefined,
      };

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

      expect(result.libraryClassification).toEqual({
        deweyDecimal: '813.6',
      });
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

    it('should throw error when validation fails', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {});

      await expect(sut.handle(command)).rejects.toThrow('Validation failed');
    });

    it('should throw error when book not found', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoFail('Book not found', 404));

      await expect(sut.handle(command)).rejects.toThrow('Book not found');
    });

    it('should throw error when repository returns no data', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(null as any));

      await expect(sut.handle(command)).rejects.toThrow('Book not found');
    });

    it('should throw error when update fails', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoFail('Database error', 500));

      await expect(sut.handle(command)).rejects.toThrow('Database error');
    });

    it('should throw error when update returns no data', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '823.914',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      await expect(sut.handle(command)).rejects.toThrow('Failed to update classification');
    });

    it('should throw error with invalid Dewey Decimal format', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '81.3',
      });

      await expect(sut.handle(command)).rejects.toThrow('Validation failed');
      await expect(sut.handle(command)).rejects.toThrow('Dewey Decimal must be in format XXX.XX');
    });

    it('should throw error with invalid OCLC number', async () => {
      const command = new UpdateClassificationCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: 'ABC123',
      });

      await expect(sut.handle(command)).rejects.toThrow('Validation failed');
      await expect(sut.handle(command)).rejects.toThrow('OCLC number must contain only digits');
    });
  });
});
