import { BookController } from "@controllers/book.controller";
import { Book } from "@data/entities/book";
import { CreateBookCommand } from "@features/book/commands/createBook.command";
import { DeleteBookCommand } from "@features/book/commands/deleteBook.command";
import { ReadBookQuery } from "@features/book/queries/readBook.query";
import { ReadBookListQuery } from "@features/book/queries/readBookList.query";
import { fakeBooks } from "@fixtures/books";
import { ICommandHandler } from "@libs/cqrs/commandHandler";
import { IQueryHandler } from "@libs/cqrs/queryHandler";
import { Request as ExpressRequest } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import httpMocks from 'node-mocks-http';

describe('BookController', () => {
  const mockReadBookListHandler = mock<IQueryHandler<ReadBookListQuery, Book[]>>();
  const mockReadBookHandler = mock<IQueryHandler<ReadBookQuery, Book>>();
  const mockCreateBookCommandHandler = mock<ICommandHandler<CreateBookCommand, Book>>();
  const mockDeleteBookCommandHandler = mock<ICommandHandler<DeleteBookCommand, void>>();

  let sut: BookController;  

  const createMockRequest = (params: any = {}, body: any = {}, query: any = {}) => {
    const req = httpMocks.createRequest({
      params: params,
      body: body,
      query: query,
    }) as ExpressRequest;
    return req;
  };

  beforeEach(() => {
    mockReset(mockReadBookListHandler);
    mockReset(mockReadBookHandler);
    mockReset(mockCreateBookCommandHandler);
    mockReset(mockDeleteBookCommandHandler);

    sut = new BookController(
      mockReadBookListHandler,
      mockReadBookHandler,
      mockCreateBookCommandHandler,
      mockDeleteBookCommandHandler,
    );    
  });

  describe('getBooks', () => {
    
    it('should return a list of books on success', async () => {
      mockReadBookListHandler.handle.mockResolvedValue(fakeBooks);
      let req = createMockRequest();
      let res = httpMocks.createResponse();

      await sut.getBooks(req, res);

      expect(mockReadBookListHandler.handle).toHaveBeenCalledWith(new ReadBookListQuery());
      expect(res.statusCode).toBe(200); 
      const responseData = JSON.parse(res._getData());
      expect(responseData).toBeInstanceOf(Array);
      expect(responseData.length).toBe(fakeBooks.length);
    });
  });
});
