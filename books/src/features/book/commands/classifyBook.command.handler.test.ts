import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { BookRepository } from '@data/repos/book.repository';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { ClassifyBookCommandHandler } from './classifyBook.command.handler';
import { ClassifyBookCommand } from './classifyBook.command';
import { mock, mockReset } from 'jest-mock-extended';
import { isCommandOk, isCommandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';

describe('ClassifyBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  let sut: ClassifyBookCommandHandler;

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
      });

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

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          deweyDecimal: '813.6',
          libraryOfCongressNumber: 'PZ7.R79835',
          oclcNumber: '123456789',
        });
      }
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
      });

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

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          deweyDecimal: '813.6',
        });
      }
    });

    it('should classify book with only Library of Congress number', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        libraryOfCongressNumber: 'PZ7.R79835',
      });

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

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          libraryOfCongressNumber: 'PZ7.R79835',
        });
      }
    });

    it('should classify book with only OCLC number', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: '123456789',
      });

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

      expect(isCommandOk(result)).toBe(true);
      if (isCommandOk(result)) {
        expect(result.data.libraryClassification).toEqual({
          oclcNumber: '123456789',
        });
      }
    });

    it('should increment book version', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      });

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
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {});

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
        expect(result.error.message).toContain('At least one classification field');
        expect(result.error.statusCode).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('should return error when book not found', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
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
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
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
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
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
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        deweyDecimal: '813.6',
      });

      mockBookRepository.getById.mockResolvedValue(repoOk(testBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expect(isCommandFail(result)).toBe(true);
      if (isCommandFail(result)) {
        expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
        expect(result.error.message).toBe('Failed to classify book');
        expect(result.error.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      }
    });

    it('should return error with invalid Dewey Decimal format', async () => {
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
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
      const command = new ClassifyBookCommand('123e4567-e89b-12d3-a456-426614174000', {
        oclcNumber: '123-456',
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
