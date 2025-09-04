import { fakeBooks } from '@fixtures/books';
import { buildMockExecutionContext } from '_test_/builders/executionContextMockBuilder';
import { mockRequestWithParams, mockRequestWithBody, mockEmptyRequest } from '_test_/builders/mockRequestBuilder';
import {
  expectSuccess,
  expectCreated,
  expectNoContent,
  expectInternalServerError,
  expectNotFound,
  expectLoggerError,
} from '_test_/helpers/controllerAssertions';
import { mock, mockReset } from 'jest-mock-extended';
import httpMocks from 'node-mocks-http';

import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { commandOk, commandFail } from '@libs/cqrs/commandResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { queryOk, queryFail } from '@libs/cqrs/queryResult';
import { ILogger } from '@libs/logging/logger.interface';

import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { Book } from '@data/entities/book.entity';

import { CreateBookCommand } from '@features/book/commands/createBook.command';
import { DeleteBookCommand } from '@features/book/commands/deleteBook.command';
import { UpdateBookCommand } from '@features/book/commands/updateBook.command';
import { BookController } from '@features/book/controllers/book.controller';
import { CreateBookDto } from '@features/book/models/createBookDto';
import { UpdateBookDto } from '@features/book/models/updateBookDto';
import { ReadBookQuery } from '@features/book/queries/readBook.query';
import { ReadBookListQuery } from '@features/book/queries/readBookList.query';






describe('BookController', () => {
  const mockReadBookListHandler = mock<IQueryHandler<ReadBookListQuery, Book[]>>();
  const mockReadBookHandler = mock<IQueryHandler<ReadBookQuery, Book>>();
  const mockCreateBookCommandHandler = mock<ICommandHandler<CreateBookCommand, Book>>();
  const mockDeleteBookCommandHandler = mock<ICommandHandler<DeleteBookCommand, void>>();
  const mockUpdateBookCommandHandler = mock<ICommandHandler<UpdateBookCommand, Book>>();
  const mockLogger = mock<ILogger>();
  const mockContext = buildMockExecutionContext()
    .withUserId('test-user-123')
    .withTimestamp(new Date('2024-01-01'))
    .build();

  let sut: BookController;

  beforeEach(() => {
    mockReset(mockReadBookListHandler);
    mockReset(mockReadBookHandler);
    mockReset(mockCreateBookCommandHandler);
    mockReset(mockDeleteBookCommandHandler);
    mockReset(mockUpdateBookCommandHandler);
    mockReset(mockLogger);

    sut = new BookController(
      mockReadBookListHandler,
      mockReadBookHandler,
      mockCreateBookCommandHandler,
      mockDeleteBookCommandHandler,
      mockUpdateBookCommandHandler,
      mockLogger,
    );
  });

  describe('getBooks', () => {
    it('should return a list of books on success', async () => {
      mockReadBookListHandler.handle.mockResolvedValue(queryOk(fakeBooks));
      const req = mockEmptyRequest();
      const res = httpMocks.createResponse();

      await sut.getBooks(req, res);

      expect(mockReadBookListHandler.handle).toHaveBeenCalledWith(new ReadBookListQuery());
      expectSuccess(res, (data) => {
        expect(data).toBeInstanceOf(Array);
        expect((data as unknown[]).length).toBe(fakeBooks.length);
      });
    });

    it('should return the correct error upon hard exception', async () => {
      mockReadBookListHandler.handle.mockResolvedValue(
        queryFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      const req = mockEmptyRequest();
      const res = httpMocks.createResponse();

      await sut.getBooks(req, res);

      expect(mockReadBookListHandler.handle).toHaveBeenCalledWith(new ReadBookListQuery());
      expectInternalServerError(res);
      expectLoggerError(mockLogger, 'Operation failed', (context) => {
        const ctx = context as { statusCode: number; duration: number };
        expect(ctx.statusCode).toBe(500);
        expect(ctx.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('getBookById', () => {
    it('should return the correct book by id', async () => {
      const bookId = 'fdd96c5d-3c69-4e58-a23e-41c18d93f8bc';
      const book = fakeBooks.find((b) => b.id === bookId)!;
      mockReadBookHandler.handle.mockResolvedValue(queryOk(book));

      const req = mockRequestWithParams({ id: bookId });
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);

      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expectSuccess(res, (data) => {
        const bookData = data as Book & { createdAt: string; updatedAt: string };
        expect(bookData.createdAt).toBe(book.createdAt.toISOString());
        expect(bookData.updatedAt).toBe(book.updatedAt.toISOString());
      });
    });

    it('should return correct error when book not found', async () => {
      const bookId = 'c6495368-edc2-4e16-a525-bf6837e38da2';
      mockReadBookHandler.handle.mockResolvedValue(
        queryFail(ErrorCodes.BOOK_NOT_FOUND, 'Book not found', HttpStatus.NOT_FOUND),
      );

      const req = mockRequestWithParams({ id: bookId });
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);

      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expectNotFound(res, 'Book not found');
      // Note: 404 errors log as warnings, not errors, so no expectLoggerError
    });

    it('should return the correct error upon hard exception', async () => {
      const bookId = '911aa084-ad4b-4d16-a0b6-cad5fe2589c6';
      mockReadBookHandler.handle.mockResolvedValue(
        queryFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      const req = mockRequestWithParams({ id: bookId });
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);

      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expectInternalServerError(res);
      expectLoggerError(mockLogger, 'Operation failed', (context) => {
        const ctx = context as { statusCode: number; duration: number };
        expect(ctx.statusCode).toBe(500);
        expect(ctx.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('createBook', () => {
    it('should create a book successfully', async () => {
      const createBookDto: CreateBookDto = {
        name: 'New Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
      };

      const createdBook: Book = {
        id: '873ec84b-bf76-41e5-b5f8-1f585f7027e4',
        bookId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4',
        entityType: ENTITY_TYPES.BOOK,
        name: 'New Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
        createdAt: new Date('2024-01-01'),
        createdBy: 'test-user',
        updatedAt: new Date('2024-01-01'),
        updatedBy: 'test-user',
        isDeleted: false,
        version: 1,
      };

      mockCreateBookCommandHandler.handle.mockResolvedValue(commandOk(createdBook));
      const req = mockRequestWithBody({}, createBookDto);
      const res = httpMocks.createResponse();

      await sut.createBook(req, res, mockContext);

      expect(mockCreateBookCommandHandler.handle).toHaveBeenCalledWith(new CreateBookCommand(createBookDto, mockContext));
      expectCreated(res, (data) => {
        const bookData = data as Book & { createdAt: string; updatedAt: string };
        expect(bookData.createdAt).toBe(createdBook.createdAt.toISOString());
        expect(bookData.updatedAt).toBe(createdBook.updatedAt.toISOString());
      });
    });

    it('should return the correct error upon hard exception', async () => {
      const createBookDto: CreateBookDto = {
        name: 'New Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
      };

      mockCreateBookCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      const req = mockRequestWithBody({}, createBookDto);
      const res = httpMocks.createResponse();

      await sut.createBook(req, res, mockContext);

      expect(mockCreateBookCommandHandler.handle).toHaveBeenCalledWith(new CreateBookCommand(createBookDto, mockContext));
      expectInternalServerError(res);
      expectLoggerError(mockLogger, 'Operation failed', (context) => {
        const ctx = context as { statusCode: number; duration: number };
        expect(ctx.statusCode).toBe(500);
        expect(ctx.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('deleteBook', () => {
    it('should delete the correct book by id', async () => {
      const id = '41ca7c11-87d8-4d18-b210-74099094ec31';
      mockDeleteBookCommandHandler.handle.mockResolvedValue(commandOk(undefined as void));

      const req = mockRequestWithParams({ id });
      const res = httpMocks.createResponse();

      await sut.deleteBook(req, res, mockContext);

      expect(mockDeleteBookCommandHandler.handle).toHaveBeenCalledWith(new DeleteBookCommand(id, mockContext));
      expectNoContent(res);
    });

    it('should return the correct error upon hard exception', async () => {
      const id = '40fb8622-652d-4edb-b665-1d97a5374b67';
      mockDeleteBookCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Some Delete error', HttpStatus.INTERNAL_SERVER_ERROR),
      );
      const req = mockRequestWithParams({ id });
      const res = httpMocks.createResponse();

      await sut.deleteBook(req, res, mockContext);

      expect(mockDeleteBookCommandHandler.handle).toHaveBeenCalledWith(new DeleteBookCommand(id, mockContext));
      expectInternalServerError(res);
      expectLoggerError(mockLogger, 'Operation failed', (context) => {
        const ctx = context as { statusCode: number; duration: number };
        expect(ctx.statusCode).toBe(500);
        expect(ctx.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('updateBook', () => {
    it('should update the correct book by id', async () => {
      const id = '41ca7c11-87d8-4d18-b210-74099094ec31';
      const updateBookDto: UpdateBookDto = {
        id: id,
        name: 'Update Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
      };

      const updatedBook: Book = {
        id: id,
        bookId: id,
        entityType: ENTITY_TYPES.BOOK,
        name: 'Update Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
        createdAt: new Date('2024-01-01'),
        createdBy: 'test-user',
        updatedAt: new Date('2024-01-01'),
        updatedBy: 'test-user',
        isDeleted: false,
        version: 1,
      };

      mockUpdateBookCommandHandler.handle.mockResolvedValue(commandOk(updatedBook));

      const req = mockRequestWithParams({ id });
      req.body = updateBookDto;
      const res = httpMocks.createResponse();

      await sut.updateBook(req, res, mockContext);

      expect(mockUpdateBookCommandHandler.handle).toHaveBeenCalledWith(new UpdateBookCommand(updateBookDto, mockContext));
      expectSuccess(res);
    });

    it('should return the correct error upon hard exception', async () => {
      const id = '41ca7c11-87d8-4d18-b210-74099094ec31';
      const updateBookDto: UpdateBookDto = {
        id: id,
        name: 'Update Book',
        authors: [
          { authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: 'Alice', lastName: 'Smith', order: 1 },
        ],
      };

      mockUpdateBookCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR),
      );

      const req = mockRequestWithParams({ id });
      req.body = updateBookDto;
      const res = httpMocks.createResponse();

      await sut.updateBook(req, res, mockContext);

      expectInternalServerError(res);
      expectLoggerError(mockLogger, 'Operation failed', (context) => {
        const ctx = context as { statusCode: number; duration: number };
        expect(ctx.statusCode).toBe(500);
        expect(ctx.duration).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
