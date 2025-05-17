import { BookController } from "@controllers/book.controller";
import { Book } from "@data/entities/book";
import { CreateBookCommand } from "@features/book/commands/createBook.command";
import { DeleteBookCommand } from "@features/book/commands/deleteBook.command";
import { UpdateBookCommand } from "@features/book/commands/updateBook.command";
import { CreateBookDto } from "@features/book/models/createBookDto";
import { UpdateBookDto } from "@features/book/models/updateBookDto";
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
  const mockUpdateBookCommandHandler = mock<ICommandHandler<UpdateBookCommand, Book>>();

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
    mockReset(mockUpdateBookCommandHandler);

    sut = new BookController(
      mockReadBookListHandler,
      mockReadBookHandler,
      mockCreateBookCommandHandler,
      mockDeleteBookCommandHandler,
      mockUpdateBookCommandHandler
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

    it('should return the correct error upon hard exception', async () => {
      mockReadBookListHandler.handle.mockRejectedValue(new Error('Whoops! There was a Cosmos Error!'));
      const req = createMockRequest();
      const res = httpMocks.createResponse();

      await sut.getBooks(req, res);
      expect(mockReadBookListHandler.handle).toHaveBeenCalledWith(new ReadBookListQuery());
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ message: 'Failed to list books' });
    });

  });

  describe('getBookById', () => {
    
    it('should return the correct book by id', async () => {
      const bookId = 'fdd96c5d-3c69-4e58-a23e-41c18d93f8bc';
      const book = fakeBooks.find(b => b.id === bookId)!;
      mockReadBookHandler.handle.mockResolvedValue(book);

      const req = createMockRequest({ id: bookId });
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);
      
      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(book);

    });

    it('should return correct error when book not found', async () => {
      const bookId = 'c6495368-edc2-4e16-a525-bf6837e38da2';      
      mockReadBookHandler.handle.mockResolvedValue(null!);
      
      const req = createMockRequest({ id: bookId });            
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);
      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ error: 'Book not found' });
    });

    it('should return the correct error upon hard exception', async () => {
      const bookId = '911aa084-ad4b-4d16-a0b6-cad5fe2589c6';      
      mockReadBookHandler.handle.mockRejectedValue(new Error('Whoops! There was a Cosmos Error!'));
      
      const req = createMockRequest({ id: bookId });            
      const res = httpMocks.createResponse();

      await sut.getBookById(req, res);
      expect(mockReadBookHandler.handle).toHaveBeenCalledWith(new ReadBookQuery(bookId));
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ error: 'Failed to retrieve book' });
    });
  });

  describe('createBook', () => {
    
    it('should create a book successfully', async () => {
      const createBookDto: CreateBookDto =  {
        name: "New Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };

      const createdBook: Book = {
        id: "873ec84b-bf76-41e5-b5f8-1f585f7027e4",
        bookId: "873ec84b-bf76-41e5-b5f8-1f585f7027e4",
        entityType: "Book",
        name: "New Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };

      mockCreateBookCommandHandler.handle.mockResolvedValue(createdBook);
      const req = createMockRequest({}, createBookDto);
      const res = httpMocks.createResponse();

      await sut.createBook(req, res);

      expect(mockCreateBookCommandHandler.handle).toHaveBeenCalledWith(new CreateBookCommand(createBookDto));
      expect(res.statusCode).toBe(201);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(createdBook);
    });

    it('should return the correct error upon hard exception', async () => {
      const createBookDto: CreateBookDto =  {
        name: "New Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };

      mockCreateBookCommandHandler.handle.mockRejectedValue(new Error('Whoops! There was a Cosmos Error!'));
      const req = createMockRequest({}, createBookDto);
      const res = httpMocks.createResponse();
      
      await sut.createBook(req, res);

      expect(mockCreateBookCommandHandler.handle).toHaveBeenCalledWith(new CreateBookCommand(createBookDto));
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ message: "Failed to create book" });
    });
  });

  describe('deleteBook', () => {
    
    it('should delete the correct book by id', async () => {
      const id = "41ca7c11-87d8-4d18-b210-74099094ec31";
      mockDeleteBookCommandHandler.handle.mockResolvedValue(undefined);
      
      const req = createMockRequest({ id });
      const res = httpMocks.createResponse();

      
      await sut.deleteBook(req, res);
      
      expect(mockDeleteBookCommandHandler.handle).toHaveBeenCalledWith(new DeleteBookCommand(id));
      expect(res.statusCode).toBe(204);
      expect(res._getData()).toBe("");
    });

    it('should return correct error when book not found', async () => {

    });

    it('should return the correct error upon hard exception', async () => {
      const id = "40fb8622-652d-4edb-b665-1d97a5374b67";
      mockDeleteBookCommandHandler.handle.mockRejectedValue(new Error("Some Delete error"));
      const req = createMockRequest({ id });
      const res = httpMocks.createResponse();

      await sut.deleteBook(req, res);

      expect(mockDeleteBookCommandHandler.handle).toHaveBeenCalledWith(new DeleteBookCommand(id));
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ error: "Failed to delete book" });
    });
  });

  describe('updateBook', () => {
    it('should update the correct book by id', async () => {
      const id = "41ca7c11-87d8-4d18-b210-74099094ec31";
      const updateBookDto: UpdateBookDto =  {
        id: id,
        name: "Update Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };

      const updatedBook: Book = {
        id: id,
        bookId: id,
        entityType: "Book",
        name: "Update Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };      
      
      mockUpdateBookCommandHandler.handle.mockResolvedValue(updatedBook);
      
      const req = createMockRequest({ id });
      req.body = updateBookDto;
      const res = httpMocks.createResponse();
      
      await sut.updateBook(req, res);
      
      expect(mockUpdateBookCommandHandler.handle).toHaveBeenCalledWith(new UpdateBookCommand(updateBookDto));
      expect(res.statusCode).toBe(200);
      expect(res._getData()).toEqual(JSON.stringify(updatedBook));
    });

    it('should return the correct error upon hard exception', async () => {
      const id = "41ca7c11-87d8-4d18-b210-74099094ec31";
      const updateBookDto: UpdateBookDto =  {
        id: id,
        name: "Update Book",
        authors: [{authorId: '873ec84b-bf76-41e5-b5f8-1f585f7027e4', firstName: "Alice", lastName: "Smith" }],
      };

      mockUpdateBookCommandHandler.handle.mockRejectedValue(new Error('Whoops! There was a Cosmos Error!'));

      const req = createMockRequest({ id });
      req.body = updateBookDto;
      const res = httpMocks.createResponse();

      await sut.updateBook(req, res);

      expect(res.statusCode).toBe(500);
      expect(res._getData()).toEqual(JSON.stringify({ error: 'Failed to update book' }));
    });
  });

});
