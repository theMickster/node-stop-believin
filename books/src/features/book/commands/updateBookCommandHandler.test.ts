import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import { expectCommandSuccess, expectValidationError, expectDatabaseError } from '@tests/helpers/commandAssertions';
import { TEST_UUID, TEST_USER_ID, TEST_USER_NAME, TEST_DATE_START_OF_2024 } from '@tests/helpers/resuableConstants';
import { mock, mockReset } from 'jest-mock-extended';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';
import { repoOk, repoFail } from '@data/libs/repoResult';
import { BookRepository } from '@data/repos/book.repository';

import { UpdateBookDto } from '@features/book/models/updateBookDto';

import { UpdateBookValidator } from '../validators/updateBook.validator';

import { UpdateBookCommand } from './updateBook.command';
import { UpdateBookCommandHandler } from './updateBook.command.handler';

describe('UpdateBookCommandHandler', () => {
  const mockBookRepository = mock<BookRepository>();
  const mockValidator = mock<UpdateBookValidator>();
  const mockContext = buildMockExecutionContext().withUserId('system').withTimestamp(new Date('2024-12-01')).build();
  let sut: UpdateBookCommandHandler;

  const validUpdateDto: UpdateBookDto = {
    id: TEST_UUID,
    name: 'Updated Book Title',
    authors: [
      {
        authorId: '456e7890-e89b-12d3-a456-426614174001',
        firstName: 'Jane',
        lastName: 'Doe',
        order: 1,
      },
    ],
  };

  const updatedBook: Book = {
    id: TEST_UUID,
    bookId: TEST_UUID,
    entityType: ENTITY_TYPES.BOOK,
    name: 'Updated Book Title',
    authors: [
      {
        authorId: '456e7890-e89b-12d3-a456-426614174001',
        firstName: 'Jane',
        lastName: 'Doe',
        order: 1,
      },
    ],
    createdAt: TEST_DATE_START_OF_2024,
    createdBy: TEST_USER_NAME,
    updatedAt: new Date('2024-12-01'),
    updatedBy: TEST_USER_ID,
    isDeleted: false,
    version: 2,
  };

  beforeEach(() => {
    mockReset(mockBookRepository);
    mockReset(mockValidator);
    sut = new UpdateBookCommandHandler(mockBookRepository, mockValidator);
  });

  describe('handle', () => {
    it('should update book successfully', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data).toEqual(updatedBook);
      });

      expect(mockValidator.validate).toHaveBeenCalledWith(validUpdateDto);
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validUpdateDto.id,
          name: validUpdateDto.name,
          authors: expect.arrayContaining([
            expect.objectContaining({
              authorId: '456e7890-e89b-12d3-a456-426614174001',
              firstName: 'Jane',
              lastName: 'Doe',
            }),
          ]),
        }),
      );
    });

    it('should update book with multiple authors', async () => {
      const dtoWithMultipleAuthors: UpdateBookDto = {
        ...validUpdateDto,
        authors: [
          {
            authorId: '456e7890-e89b-12d3-a456-426614174001',
            firstName: 'Jane',
            lastName: 'Doe',
            order: 1,
          },
          {
            authorId: '789e0123-e89b-12d3-a456-426614174002',
            firstName: 'John',
            lastName: 'Smith',
            order: 2,
          },
        ],
      };

      const command = new UpdateBookCommand(dtoWithMultipleAuthors, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          authors: expect.arrayContaining([
            expect.objectContaining({ firstName: 'Jane', lastName: 'Doe' }),
            expect.objectContaining({ firstName: 'John', lastName: 'Smith' }),
          ]),
        }),
      );
    });

    it('should update book with author display name and role', async () => {
      const dtoWithAuthorDetails: UpdateBookDto = {
        ...validUpdateDto,
        authors: [
          {
            authorId: '456e7890-e89b-12d3-a456-426614174001',
            firstName: 'Jane',
            lastName: 'Doe',
            displayName: 'J. Doe',
            role: 'Author',
            order: 1,
          },
        ],
      };

      const command = new UpdateBookCommand(dtoWithAuthorDetails, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          authors: expect.arrayContaining([
            expect.objectContaining({
              displayName: 'J. Doe',
              role: 'Author',
            }),
          ]),
        }),
      );
    });

    it('should call validator with correct dto', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      await sut.handle(command);

      expect(mockValidator.validate).toHaveBeenCalledTimes(1);
      expect(mockValidator.validate).toHaveBeenCalledWith(validUpdateDto);
    });

    it('should call repository update with mapped book', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      await sut.handle(command);

      expect(mockBookRepository.update).toHaveBeenCalledTimes(1);
      expect(mockBookRepository.update).toHaveBeenCalledWith(
        expect.objectContaining({
          id: validUpdateDto.id,
          bookId: validUpdateDto.id,
          entityType: ENTITY_TYPES.BOOK,
          name: validUpdateDto.name,
        }),
      );
    });

    it('should return CommandResult with success true', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      const result = await sut.handle(command);

      expectCommandSuccess(result, (data) => {
        expect(data).toEqual(updatedBook);
      });
    });

    it('should return CommandResult with failure when validation fails', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Book name is required'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Book name is required');
      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('should return failure with validation error message', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Author ID must be a valid GUID'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Author ID must be a valid GUID');
    });

    it('should not call repository when validation fails', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation failed'),
      });

      await sut.handle(command);

      expect(mockBookRepository.update).not.toHaveBeenCalled();
    });

    it('should return CommandResult with error when repository update fails', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoFail('Database connection failed', 500));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Database connection failed');
    });

    it('should return CommandResult with error when repository returns no data', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoOk(null as any));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Unknown error updating book');
    });

    it('should return CommandResult with error when repository returns unsuccessful result with no error message', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      mockBookRepository.update.mockResolvedValue(repoFail(null as any, 500));

      const result = await sut.handle(command);

      expectDatabaseError(result, 'Unknown error updating book');
    });

    it('should handle validation error for missing book ID', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Book ID is required'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Book ID is required');
    });

    it('should handle validation error for invalid book ID format', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Book ID must be a valid guid'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Book ID must be a valid guid');
    });

    it('should handle validation error for missing authors', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: At least one author is required'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'At least one author is required');
    });

    it('should handle validation error for author name too short', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: First name must be at least 2 characters'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'First name must be at least 2 characters');
    });

    it('should handle validation error for invalid author order', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error('Validation error: Order must be at least 1'),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'Order must be at least 1');
    });

    it('should handle book not found from validator', async () => {
      const command = new UpdateBookCommand(validUpdateDto, mockContext);

      mockValidator.validate.mockResolvedValue({
        valid: false,
        error: new Error(`Validation error: Book with ID ${TEST_UUID} does not exist`),
      });

      const result = await sut.handle(command);

      expectValidationError(result, 'does not exist');
    });

    it('should preserve author order in mapped book', async () => {
      const dtoWithOrderedAuthors: UpdateBookDto = {
        ...validUpdateDto,
        authors: [
          {
            authorId: '111',
            firstName: 'First',
            lastName: 'Author',
            order: 1,
          },
          {
            authorId: '222',
            firstName: 'Second',
            lastName: 'Author',
            order: 2,
          },
          {
            authorId: '333',
            firstName: 'Third',
            lastName: 'Author',
            order: 3,
          },
        ],
      };

      const command = new UpdateBookCommand(dtoWithOrderedAuthors, mockContext);

      mockValidator.validate.mockResolvedValue({ valid: true });
      mockBookRepository.getById.mockResolvedValue(repoOk(updatedBook));
      mockBookRepository.update.mockResolvedValue(repoOk(updatedBook));

      await sut.handle(command);

      const updateCall = mockBookRepository.update.mock.calls[0][0];
      expect(updateCall.authors).toHaveLength(3);
      expect(updateCall.authors[0].order).toBe(1);
      expect(updateCall.authors[1].order).toBe(2);
      expect(updateCall.authors[2].order).toBe(3);
    });
  });
});
