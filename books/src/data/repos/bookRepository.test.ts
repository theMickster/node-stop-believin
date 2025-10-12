import { Container as CosmosContainer } from '@azure/cosmos';
import { Book } from '@data/entities/book.entity';
import { repoOk } from '@data/libs/repoResult';
import { fakeCosmicBooks } from '@fixtures/books';
import { BookRepository } from './bookRepository';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';


describe('BookRepository', () => {
  let sut: BookRepository;
  let mockContainer: jest.Mocked<CosmosContainer>;
  let testBook: Book;

  beforeEach(() => {
    jest.clearAllMocks();

    testBook = {
      id: '10000000-0000-0000-0000-000000000001',
      bookId: '10000000-0000-0000-0000-000000000001',
      name: 'Test Book',
      entityType: ENTITY_TYPES.BOOK,
      authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname', order: 1 }],
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'test-user',
      isDeleted: false,
      version: 1,
    };

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

      expect(mockContainer.items.query).toHaveBeenCalledWith({
        query: 'SELECT * FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: ENTITY_TYPES.BOOK }],
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10);
      expect(result.data?.[5]).toEqual(fakeCosmicBooks[5]);
    });

    it('should return fail result when query throws error', async () => {
      const fetchAllMock = jest.fn().mockRejectedValue(new Error('Cosmos DB error'));
      (mockContainer.items.query as jest.Mock).mockReturnValue({
        fetchAll: fetchAllMock,
      });

      const result = await sut.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve books from the Cosmos DB.');
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
        expect(mockContainer.item).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000007', ['00000000-0000-0000-0000-000000000007', ENTITY_TYPES.BOOK]);
        expect(result.data).toEqual(book);
    });

    it('should return fail result when resource is undefined', async () => {
      const readMock = jest.fn().mockResolvedValue({ resource: undefined });
      (mockContainer.item as jest.Mock).mockReturnValue({ read: readMock });

      const result = await sut.getById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Book not found');
    });

    it('should return fail result when Cosmos DB throws 404 error', async () => {
      const readMock = jest.fn().mockRejectedValue({ code: 404 });
      (mockContainer.item as jest.Mock).mockReturnValue({ read: readMock });

      const result = await sut.getById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Book not found');
    });

    it('should return fail result when Cosmos DB throws general error', async () => {
      const readMock = jest.fn().mockRejectedValue({ code: 500 });
      (mockContainer.item as jest.Mock).mockReturnValue({ read: readMock });

      const result = await sut.getById('some-id');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve book');
    });
  });

  describe('create', () => {
    it('should create a book and return valid entity', async () => {
      (mockContainer.items.create as jest.Mock).mockResolvedValue({ resource: testBook });

      const result = await sut.create(testBook);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testBook);
      expect(mockContainer.items.create).toHaveBeenCalledWith(testBook);
    });

    it('should return fail result if resource is null', async () => {
      (mockContainer.items.create as jest.Mock).mockResolvedValue({ resource: null });

      const result = await sut.create(testBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create book');
    });

    it('should return fail result when Cosmos DB throws error', async () => {
      (mockContainer.items.create as jest.Mock).mockRejectedValue(new Error('Cosmos error'));

      const result = await sut.create(testBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create book');
    });
  });

  describe('update', () => {
    it('should update a book and return valid entity', async () => {
      const replace = jest.fn().mockResolvedValue({ resource: testBook });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(testBook);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(testBook);
      expect(mockContainer.item).toHaveBeenCalledWith(testBook.id, [testBook.id, ENTITY_TYPES.BOOK]);
    });

    it('should return fail result when resource is null', async () => {
      const replace = jest.fn().mockResolvedValue({ resource: null });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(testBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update book');
    });

    it('should return fail result when Cosmos DB throws general error', async () => {
      const replace = jest.fn().mockRejectedValue({ code: 500 });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(testBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update book');
    });

    it('should return not found when Cosmos DB responds 404', async () => {
      const replace = jest.fn().mockRejectedValue({ code: 404 });
      (mockContainer.item as jest.Mock).mockReturnValue({ replace });

      const result = await sut.update(testBook);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Book not found');
    });
  });

  describe('delete', () => {
    it('should return success when book is deleted', async () => {
      const del = jest.fn().mockResolvedValue({});
      (mockContainer.item as jest.Mock).mockReturnValue({ delete: del });

      const result = await sut.delete('book-id-123');

      expect(result).toEqual(repoOk(undefined));
      expect(mockContainer.item).toHaveBeenCalledWith('book-id-123', ['book-id-123', ENTITY_TYPES.BOOK]);
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

  describe('isbnExists', () => {
    describe('when ISBN exists in database', () => {
      it('should return true when ISBN-13 matches', async () => {
        const isbn = { isbn13: '9781234567890' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [1] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
        expect(mockContainer.items.query).toHaveBeenCalledWith({
          query: expect.stringContaining('SELECT VALUE COUNT(1)'),
          parameters: expect.arrayContaining([
            { name: '@entityType', value: ENTITY_TYPES.BOOK },
            { name: '@isbn13', value: '9781234567890' },
          ]),
        });
      });

      it('should return true when ISBN-10 matches', async () => {
        const isbn = { isbn10: '1234567890' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [1] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });

      it('should return true when both ISBN-10 and ISBN-13 are provided', async () => {
        const isbn = { isbn10: '1234567890', isbn13: '9781234567890' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [1] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });
    });

    describe('when ISBN does not exist in database', () => {
      it('should return false when no matches found', async () => {
        const isbn = { isbn13: '9780000000000' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [0] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
      });

      it('should return false when resources array is empty', async () => {
        const isbn = { isbn13: '9780000000000' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
      });
    });

    describe('when excluding a specific book ID', () => {
      it('should return false when ISBN belongs only to excluded book', async () => {
        const isbn = { isbn13: '9781234567890' };
        const excludeBookId = 'book-123';
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [0] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn, excludeBookId);

        expect(result.success).toBe(true);
        expect(result.data).toBe(false);
        expect(mockContainer.items.query).toHaveBeenCalledWith({
          query: expect.stringContaining('c.id != @excludeBookId'),
          parameters: expect.arrayContaining([
            { name: '@entityType', value: ENTITY_TYPES.BOOK },
            { name: '@excludeBookId', value: 'book-123' },
          ]),
        });
      });

      it('should return true when ISBN belongs to another book besides excluded one', async () => {
        const isbn = { isbn13: '9781234567890' };
        const excludeBookId = 'book-123';
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [1] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn, excludeBookId);

        expect(result.success).toBe(true);
        expect(result.data).toBe(true);
      });

      it('should include exclusion clause in query when excludeBookId is provided', async () => {
        const isbn = { isbn13: '9781234567890' };
        const excludeBookId = 'book-456';
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [0] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        await sut.isbnExists(isbn, excludeBookId);

        const callArgs = (mockContainer.items.query as jest.Mock).mock.calls[0][0];
        expect(callArgs.query).toContain('AND c.id != @excludeBookId');
        expect(callArgs.parameters).toContainEqual({ name: '@excludeBookId', value: 'book-456' });
      });

      it('should not include exclusion clause when excludeBookId is not provided', async () => {
        const isbn = { isbn13: '9781234567890' };
        const fetchAllMock = jest.fn().mockResolvedValue({ resources: [0] });
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        await sut.isbnExists(isbn);

        const callArgs = (mockContainer.items.query as jest.Mock).mock.calls[0][0];
        expect(callArgs.query).not.toContain('excludeBookId');
        expect(callArgs.parameters).not.toContainEqual(expect.objectContaining({ name: '@excludeBookId' }));
      });
    });

    describe('when query fails', () => {
      it('should return failure result with appropriate error message', async () => {
        const isbn = { isbn13: '9781234567890' };
        const fetchAllMock = jest.fn().mockRejectedValue(new Error('Database error'));
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to check ISBN existence');
        expect(result.statusCode).toBe(500);
      });

      it('should return failure result on network timeout', async () => {
        const isbn = { isbn10: '1234567890' };
        const fetchAllMock = jest.fn().mockRejectedValue(new Error('Timeout'));
        (mockContainer.items.query as jest.Mock).mockReturnValue({ fetchAll: fetchAllMock });

        const result = await sut.isbnExists(isbn);

        expect(result.success).toBe(false);
        expect(result.error).toBe('Failed to check ISBN existence');
      });
    });
  });

});