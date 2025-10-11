import { Book } from "@data/entities/book.entity";
import { RepoResult } from "@data/libs/repoResult";
import { BookRepository } from "@data/repos/bookRepository";
import { fakeBooks } from "@fixtures/books";
import { ReadBookQueryHandler } from "./readBook.query.handler";

jest.mock('@data/repos/bookRepository');

describe('ReadBookQueryHandler', () => {
      let mockBookRepository: jest.Mocked<BookRepository>;
      let sut: ReadBookQueryHandler;
      const query = { id: 'd551376d-d645-4311-880b-accad096112b' };

      const successResult: RepoResult<Book> = {
        success: true,
        data: fakeBooks[1],
        statusCode: 0,
      };

      beforeEach(() => {
        jest.clearAllMocks();

        mockBookRepository = {
          getAll: jest.fn(),
          getById: jest.fn(),
          create: jest.fn(),
        } as unknown as jest.Mocked<BookRepository>;
    
        sut = new ReadBookQueryHandler(mockBookRepository);
      });

      it('should return a book if it exists', async () => {
        mockBookRepository.getById.mockResolvedValue(successResult);
        
        const result = await sut.handle(query);
    
        expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
        expect(result?.id).toEqual('d551376d-d645-4311-880b-accad096112b');
        expect(result?.authors.length).toEqual(1);
        expect(result?.name).toEqual('Complete Guide to Azure AI for ML Engineers');
      });

      it('should return null if the book is not found', async () => {
        const notFoundResult: RepoResult<Book> = {success: false, data: null, error: 'Book not found', statusCode: 404};
        mockBookRepository.getById.mockResolvedValue(notFoundResult);

        const result = await sut.handle(query);

        expect(result).toBeNull();
        expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
      });

      it('should throw a generic error if repository fails without message', async () => {
        mockBookRepository.getById.mockResolvedValue({success: false, data: null, error: null, statusCode: 500});

        await expect(sut.handle(query)).rejects.toThrow('Failed to retrieve books');
        expect(mockBookRepository.getById).toHaveBeenCalledWith(query.id);
      });

});