import { buildMockExecutionContext } from '_test_/builders/executionContextMockBuilder';
import {
  expectSuccess,
  expectNotFound,
  expectInternalServerError,
  expectBadRequest,
} from '_test_/helpers/controllerAssertions';
import { Request } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import httpMocks from 'node-mocks-http';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { ILogger } from '@libs/logging/logger.interface';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';


import { ClassifyBookCommand } from '@features/book/commands/classifyBook.command';
import { UpdateClassificationCommand } from '@features/book/commands/updateClassification.command';
import { BookClassifyController } from '@features/book/controllers/classify/bookClassify.controller';
import { ClassifyBookDto } from '@features/book/models/classifyBookDto';
import { UpdateClassificationDto } from '@features/book/models/updateClassificationDto';



describe('BookClassifyController', () => {
  const mockClassifyBookCommandHandler = mock<ICommandHandler<ClassifyBookCommand, Book>>();
  const mockUpdateClassificationCommandHandler = mock<ICommandHandler<UpdateClassificationCommand, Book>>();
  const mockLogger = mock<ILogger>();
  const mockContext = buildMockExecutionContext().build();

  let sut: BookClassifyController;

  const createMockClassifyRequest = (params: { id: string }, body: ClassifyBookDto) => {
    return httpMocks.createRequest({
      params,
      body,
    }) as Request<{ id: string }, object, ClassifyBookDto>;
  };

  const createMockUpdateRequest = (params: { id: string }, body: UpdateClassificationDto) => {
    return httpMocks.createRequest({
      params,
      body,
    }) as Request<{ id: string }, object, UpdateClassificationDto>;
  };

  beforeEach(() => {
    mockReset(mockClassifyBookCommandHandler);
    mockReset(mockUpdateClassificationCommandHandler);
    mockReset(mockLogger);

    sut = new BookClassifyController(
      mockClassifyBookCommandHandler,
      mockUpdateClassificationCommandHandler,
      mockLogger,
    );
  });

  describe('classifyBook', () => {
    const bookId = '41ca7c11-87d8-4d18-b210-74099094ec31';
    const classifyBookDto: ClassifyBookDto = {
      deweyDecimal: '813.6',
      libraryOfCongressNumber: 'PZ7.R79835',
      oclcNumber: '123456789',
    };

    const classifiedBook: Book = {
      id: bookId,
      bookId: bookId,
      entityType: ENTITY_TYPES.BOOK,
      name: 'Test Book',
      authors: [{ authorId: '123', firstName: 'John', lastName: 'Doe', order: 1 }],
      libraryClassification: {
        deweyDecimal: '813.6',
        libraryOfCongressNumber: 'PZ7.R79835',
        oclcNumber: '123456789',
      },
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2025-01-15'),
      updatedBy: 'system',
      isDeleted: false,
      version: 2,
    };

    it('should classify a book successfully', async () => {
      mockClassifyBookCommandHandler.handle.mockResolvedValue(commandOk(classifiedBook));
      const req = createMockClassifyRequest({ id: bookId }, classifyBookDto);
      const res = httpMocks.createResponse();

      await sut.classifyBook(req, res, mockContext);

      expect(mockClassifyBookCommandHandler.handle).toHaveBeenCalledWith(
        new ClassifyBookCommand(bookId, classifyBookDto, mockContext),
      );
      expectSuccess(res, (data) => {
        const bookData = data as Book;
        expect(bookData.libraryClassification).toEqual({
          deweyDecimal: '813.6',
          libraryOfCongressNumber: 'PZ7.R79835',
          oclcNumber: '123456789',
        });
      });
    });

    it('should classify with only Dewey Decimal', async () => {
      const dto: ClassifyBookDto = {
        deweyDecimal: '813.6',
      };
      const book: Book = {
        ...classifiedBook,
        libraryClassification: {
          deweyDecimal: '813.6',
        },
      };
      mockClassifyBookCommandHandler.handle.mockResolvedValue(commandOk(book));
      const req = createMockClassifyRequest({ id: bookId }, dto);
      const res = httpMocks.createResponse();

      await sut.classifyBook(req, res, mockContext);

      expect(mockClassifyBookCommandHandler.handle).toHaveBeenCalledWith(new ClassifyBookCommand(bookId, dto, mockContext));
      expectSuccess(res, (data) => {
        const bookData = data as Book;
        expect(bookData.libraryClassification?.deweyDecimal).toBe('813.6');
      });
    });

    it('should return 404 when book is not found', async () => {
      mockClassifyBookCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND),
      );
      const req = createMockClassifyRequest({ id: bookId }, classifyBookDto);
      const res = httpMocks.createResponse();

      await sut.classifyBook(req, res, mockContext);

      expect(mockClassifyBookCommandHandler.handle).toHaveBeenCalledWith(
        new ClassifyBookCommand(bookId, classifyBookDto, mockContext),
      );
      expectNotFound(res, 'Book not found');
    });

    it('should return 500 on general error', async () => {
      mockClassifyBookCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Database connection failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      const req = createMockClassifyRequest({ id: bookId }, classifyBookDto);
      const res = httpMocks.createResponse();

      await sut.classifyBook(req, res, mockContext);

      expect(mockClassifyBookCommandHandler.handle).toHaveBeenCalledWith(
        new ClassifyBookCommand(bookId, classifyBookDto, mockContext),
      );
      expectInternalServerError(res, 'Database connection failed');
    });

    it('should return 400 on validation error', async () => {
      mockClassifyBookCommandHandler.handle.mockResolvedValue(
        commandFail(
          ErrorCodes.VALIDATION_FAILED,
          'Validation failed: At least one classification field (deweyDecimal, libraryOfCongressNumber, or oclcNumber) must be provided',
          HttpStatus.BAD_REQUEST,
        ),
      );
      const req = createMockClassifyRequest({ id: bookId }, classifyBookDto);
      const res = httpMocks.createResponse();

      await sut.classifyBook(req, res, mockContext);

      expectBadRequest(res, 'At least one classification field');
    });
  });

  describe('updateClassification', () => {
    const bookId = 'b9223c19-5a6d-4406-bf96-aefbae10746a';
    const updateClassificationDto: UpdateClassificationDto = {
      deweyDecimal: '823.914',
      libraryOfCongressNumber: 'PR6068.O93',
      oclcNumber: '987654321',
    };

    const updatedBook: Book = {
      id: bookId,
      bookId: bookId,
      entityType: ENTITY_TYPES.BOOK,
      name: 'Test Book',
      authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Smith', order: 1 }],
      libraryClassification: {
        deweyDecimal: '823.914',
        libraryOfCongressNumber: 'PR6068.O93',
        oclcNumber: '987654321',
      },
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2025-01-20'),
      updatedBy: 'system',
      isDeleted: false,
      version: 3,
    };

    it('should update classification information successfully', async () => {
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(commandOk(updatedBook));
      const req = createMockUpdateRequest({ id: bookId }, updateClassificationDto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expect(mockUpdateClassificationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdateClassificationCommand(bookId, updateClassificationDto, mockContext),
      );
      expectSuccess(res, (data) => {
        const bookData = data as Book;
        expect(bookData.libraryClassification).toEqual({
          deweyDecimal: '823.914',
          libraryOfCongressNumber: 'PR6068.O93',
          oclcNumber: '987654321',
        });
      });
    });

    it('should update classification with partial fields', async () => {
      const dto: UpdateClassificationDto = {
        deweyDecimal: '823.914',
      };
      const book: Book = {
        ...updatedBook,
        libraryClassification: {
          deweyDecimal: '823.914',
          libraryOfCongressNumber: 'PR6068.O93',
          oclcNumber: '987654321',
        },
      };
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(commandOk(book));
      const req = createMockUpdateRequest({ id: bookId }, dto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expect(mockUpdateClassificationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdateClassificationCommand(bookId, dto, mockContext),
      );
      expectSuccess(res, (data) => {
        const bookData = data as Book;
        expect(bookData.libraryClassification?.deweyDecimal).toBe('823.914');
      });
    });

    it('should clear classification fields with null values', async () => {
      const dto: UpdateClassificationDto = {
        deweyDecimal: null,
        libraryOfCongressNumber: null,
        oclcNumber: null,
      };
      const { libraryClassification: _libraryClassification, ...bookWithoutClassification } = updatedBook;
      const book: Book = {
        ...bookWithoutClassification,
      };
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(commandOk(book));
      const req = createMockUpdateRequest({ id: bookId }, dto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expect(mockUpdateClassificationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdateClassificationCommand(bookId, dto, mockContext),
      );
      expectSuccess(res, (data) => {
        const bookData = data as Book;
        expect(bookData.libraryClassification).toBeUndefined();
      });
    });

    it('should return 404 when book is not found', async () => {
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND),
      );
      const req = createMockUpdateRequest({ id: bookId }, updateClassificationDto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expect(mockUpdateClassificationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdateClassificationCommand(bookId, updateClassificationDto, mockContext),
      );
      expectNotFound(res, 'Book not found');
    });

    it('should return 500 on general error', async () => {
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Database connection failed', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      const req = createMockUpdateRequest({ id: bookId }, updateClassificationDto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expect(mockUpdateClassificationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdateClassificationCommand(bookId, updateClassificationDto, mockContext),
      );
      expectInternalServerError(res, 'Database connection failed');
    });

    it('should return 400 on validation error', async () => {
      mockUpdateClassificationCommandHandler.handle.mockResolvedValue(
        commandFail(
          ErrorCodes.VALIDATION_FAILED,
          'Validation failed: At least one classification field must be provided',
          HttpStatus.BAD_REQUEST,
        ),
      );
      const req = createMockUpdateRequest({ id: bookId }, updateClassificationDto);
      const res = httpMocks.createResponse();

      await sut.updateClassification(req, res, mockContext);

      expectBadRequest(res, 'At least one classification field must be provided');
    });
  });
});
