import { Book } from '../entities/book';
import { mapCosmosDocumentToBook } from '../mapping/bookMappers';
import { BookRepository } from '../repos/bookRepository';
import { Container as CosmosContainer } from '@azure/cosmos';
import { fakeCosmicBooks } from '@fixtures/books';

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

        expect(mockContainer.item).toHaveBeenCalledWith('00000000-0000-0000-0000-000000000007', ['00000000-0000-0000-0000-000000000007', 'Book']);
        expect(result).toEqual(mapCosmosDocumentToBook(book));
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

      expect(result).toEqual(mapCosmosDocumentToBook(inputBook));
    });
    it('should throw an error if book creation fails', async () => {
      (mockContainer.items.create as jest.Mock).mockResolvedValue({ resource: null });

      await expect(sut.create({} as Book)).rejects.toThrow('Book Repository :: Failed to create book');
    });
  });
});
