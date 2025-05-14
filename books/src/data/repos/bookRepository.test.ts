import { describe } from 'node:test';
import { Book } from '../entities/book';
import { mapCosmosDocumentToBook } from '../mapping/bookMappers';
import { BookRepository } from '../repos/bookRepository';
import { Container as CosmosContainer } from '@azure/cosmos';
import { fakeCosmicBooks } from '@fixtures/books';
import { repoOk } from 'data/libs/repoResult';

describe('BookRepository', () => {
  let sut: BookRepository;
  let mockContainer: jest.Mocked<CosmosContainer>;
  
  beforeEach(() => {
    jest.clearAllMocks();

    const fetchAllMock = jest.fn().mockResolvedValue({ resources: fakeCosmicBooks });

    mockContainer = {
      items: {
        query: jest.fn().mockReturnValue({
          fetchAll: fetchAllMock,
        }) as any,
        create: jest.fn(),
      },
      item: jest.fn(),
    } as unknown as jest.Mocked<CosmosContainer>;

    sut = new BookRepository(mockContainer);
  });

  describe('getAll', () => {
    it('should return all books', async () => {
      (mockContainer.items.query('SELECT * FROM c').fetchAll as jest.Mock).mockResolvedValue({
        resources: fakeCosmicBooks,
      });

      const result = await sut.getAll();

      expect(mockContainer.items.query).toHaveBeenCalled();
      expect(mockContainer.items.query).toHaveBeenCalledWith({
        query: 'SELECT * FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: 'Book' }],
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10);

      expect(result.data?.[5].id).toEqual(mapCosmosDocumentToBook(fakeCosmicBooks[5]).id);
      expect(result.data?.[5].bookId).toEqual(mapCosmosDocumentToBook(fakeCosmicBooks[5]).bookId);
      expect(result.data?.[4].name).toEqual(mapCosmosDocumentToBook(fakeCosmicBooks[4]).name);
    });
  });

  describe('getById', () => {
    it('should return valid book by unique id', async () => {
        const bookId = '00000000-0000-0000-0000-000000000007';
        const book = fakeCosmicBooks.find(b => b.id === bookId);
        const readMock = jest.fn().mockResolvedValue({ resource: book });

        (mockContainer.item as jest.Mock).mockReturnValue({ read: readMock });

        const result = await sut.getById('00000000-0000-0000-0000-000000000007');
        expect(result.success).toBe(true);
        expect(mockContainer.item).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000007', ['00000000-0000-0000-0000-000000000007', 'Book']);
        expect(result.data).toEqual(mapCosmosDocumentToBook(book));
    });

  });

  describe('create', () => {
    it('should create a book and return valid entity', async () => {
      const inputBook: Book = {
        id: '10000000-0000-0000-0000-000000000001',
        bookId: '10000000-0000-0000-0000-000000000001',
        name: 'Book 1',
        entityType: 'Book',
        authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname' }],
      };
      
      (mockContainer.items.create as jest.Mock).mockResolvedValue({ resource: inputBook });

      const result = await sut.create(inputBook);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mapCosmosDocumentToBook(inputBook));
    });

    it('should throw an error if book creation fails', async () => {
      const inputBook: Book = {
        id: '10000000-0000-0000-0000-000000000001',
        bookId: '10000000-0000-0000-0000-000000000001',
        name: 'Book 1',
        entityType: 'Book',
        authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname' }],
      };

      (mockContainer.items.create as jest.Mock).mockResolvedValue({ resource: null });

      const result = await sut.create(inputBook);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create book');
      expect(mockContainer.items.create).toHaveBeenCalledWith(inputBook);
    });
  });

  describe  ('update', () => {
    it('should update a book and return valid entity', async () => {
      const inputBook: Book = {
        id: '10000000-0000-0000-0000-000000000001',
        bookId: '10000000-0000-0000-0000-000000000001',
        name: 'Book 1',
        entityType: 'Book',
        authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname' }],
      };

      const replace = jest.fn().mockResolvedValue({ resource: inputBook });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(inputBook);

      expect(result).toEqual(repoOk(inputBook));
      expect(mockContainer.item).toHaveBeenCalledWith('book-id-123', ['book-id-123', 'Book']);
    });

    it('should return fail result when Cosmos DB throws', async () => {
      const inputBook: Book = {
        id: '10000000-0000-0000-0000-000000000001',
        bookId: '10000000-0000-0000-0000-000000000001',
        name: 'Book 1',
        entityType: 'Book',
        authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname' }],
      };

      const replace = jest.fn().mockRejectedValue({ code: 500 });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(inputBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update book');
    });

    it('should return not found when Cosmos DB responds 404', async () => {
      const inputBook: Book = {
        id: '10000000-0000-0000-0000-000000000001',
        bookId: '10000000-0000-0000-0000-000000000001',
        name: 'Book 1',
        entityType: 'Book',
        authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname' }],
      };

      const replace = jest.fn().mockRejectedValue({ code: 404 });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(inputBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Book not found');
    });
  });

  describe  ('delete', () => {
    it('should return success when book is deleted', async () => {
      const del = jest.fn().mockResolvedValue({});
      (mockContainer.item as jest.Mock).mockReturnValue({ delete: del });

      const result = await sut.delete('book-id-123');

      expect(result).toEqual(repoOk(undefined));
      expect(mockContainer.item).toHaveBeenCalledWith('book-id-123', ['book-id-123', 'Book']);
    });

    it('should return not found if book does not exist', async () => {
      const del = jest.fn().mockRejectedValue({ code: 404 });
      (mockContainer.item as jest.Mock).mockReturnValue({ delete: del });

      const result = await sut.delete('book-id-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Book not found');
    });

    it('should return fail result on unknown error', async () => {
      const del = jest.fn().mockRejectedValue({ code: 500 });
      (mockContainer.item as jest.Mock).mockReturnValue({ delete: del });

      const result = await sut.delete('book-id-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete book');
    });
  });

});