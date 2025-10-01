import { Container as CosmosContainer } from '@azure/cosmos';
import { Book } from '@data/entities/book.entity';
import { repoOk } from '@data/libs/repoResult';
import { mapCosmosDocumentToBook } from '@data/mapping/bookMappers';
import { fakeCosmicBooks } from '@fixtures/books';
import { BookRepository } from './bookRepository';


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
      entityType: 'Book',
      authors: [{ authorId: '00000000-0000-0000-0000-000000000001', firstName: 'Fname', lastName: 'Lname', order: 1 }],
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
        parameters: [{ name: '@entityType', value: 'Book' }],
      });
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(10);
      expect(result.data?.[5]).toEqual(mapCosmosDocumentToBook(fakeCosmicBooks[5]));
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
        expect(mockContainer.item).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000007', ['00000000-0000-0000-0000-000000000007', 'Book']);
        expect(result.data).toEqual(mapCosmosDocumentToBook(book));
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
      expect(result.data).toEqual(mapCosmosDocumentToBook(testBook));
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
      expect(result.data).toEqual(mapCosmosDocumentToBook(testBook));
      expect(mockContainer.item).toHaveBeenCalledWith(testBook.id, [testBook.id, 'Book']);
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