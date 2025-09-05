import { Container as CosmosContainer, ItemResponse, Items } from '@azure/cosmos';
import { TEST_DATE_START_OF_2024, TEST_USER_NAME } from '@tests/helpers/resuableConstants';

import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import { Author } from '@data/entities/author.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';

import { AuthorRepository } from './author.repository';

describe('AuthorRepository', () => {
  let mockContainer: jest.Mocked<CosmosContainer>;
  let repository: AuthorRepository;

  const mockAuthor: Author = {
    id: 'author-123',
    authorId: 'author-123',
    entityType: ENTITY_TYPES.AUTHOR,
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    genres: ['Fiction', 'Mystery'],
    status: 'Active',
    isVerified: true,
    createdAt: TEST_DATE_START_OF_2024,
    createdBy: TEST_USER_NAME,
    updatedAt: TEST_DATE_START_OF_2024,
    updatedBy: TEST_USER_NAME,
    isDeleted: false,
    version: 1,
  };

  beforeEach(() => {
    mockContainer = {
      items: {
        query: jest.fn(),
        create: jest.fn(),
      } as unknown as Items,
      item: jest.fn(),
    } as unknown as jest.Mocked<CosmosContainer>;

    repository = new AuthorRepository(mockContainer);
  });

  describe('getAll', () => {
    it('should return all authors successfully', async () => {
      const mockAuthors = [mockAuthor];
      const mockQuery = {
        fetchAll: jest.fn().mockResolvedValue({ resources: mockAuthors }),
      };
      (mockContainer.items.query as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthors);
      expect(mockContainer.items.query).toHaveBeenCalledWith({
        query: 'SELECT * FROM c WHERE c.entityType = @entityType',
        parameters: [{ name: '@entityType', value: ENTITY_TYPES.AUTHOR }],
      });
    });

    it('should return failure when query throws error', async () => {
      const mockQuery = {
        fetchAll: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (mockContainer.items.query as jest.Mock).mockReturnValue(mockQuery);

      const result = await repository.getAll();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve authors from the Cosmos DB.');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('getById', () => {
    it('should return author when found', async () => {
      const mockItem = {
        read: jest.fn().mockResolvedValue({ resource: mockAuthor } as ItemResponse<Author>),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.getById('author-123');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthor);
      expect(mockContainer.item).toHaveBeenCalledWith('author-123', ['author-123', ENTITY_TYPES.AUTHOR]);
    });

    it('should return 404 when author not found (no resource)', async () => {
      const mockItem = {
        read: jest.fn().mockResolvedValue({ resource: undefined } as ItemResponse<Author>),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.getById('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Author not found');
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when error code is 404', async () => {
      const mockItem = {
        read: jest.fn().mockRejectedValue({ code: 404 }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.getById('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Author not found');
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 404 when statusCode is 404', async () => {
      const mockItem = {
        read: jest.fn().mockRejectedValue({ code: 500, statusCode: 404 }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.getById('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Author not found');
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 500 for other errors', async () => {
      const mockItem = {
        read: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.getById('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to retrieve author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('create', () => {
    it('should create author successfully', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ resource: mockAuthor });
      (mockContainer.items.create as jest.Mock) = mockCreate;

      const result = await repository.create(mockAuthor);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthor);
      expect(mockCreate).toHaveBeenCalledWith(mockAuthor);
    });

    it('should return failure when resource is not created', async () => {
      const mockCreate = jest.fn().mockResolvedValue({ resource: undefined });
      (mockContainer.items.create as jest.Mock) = mockCreate;

      const result = await repository.create(mockAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return failure when create throws error', async () => {
      const mockCreate = jest.fn().mockRejectedValue(new Error('Database error'));
      (mockContainer.items.create as jest.Mock) = mockCreate;

      const result = await repository.create(mockAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to create author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('update', () => {
    it('should update author successfully', async () => {
      const mockItem = {
        replace: jest.fn().mockResolvedValue({ resource: mockAuthor }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.update(mockAuthor);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAuthor);
      expect(mockContainer.item).toHaveBeenCalledWith('author-123', ['author-123', ENTITY_TYPES.AUTHOR]);
    });

    it('should return failure when resource is not updated', async () => {
      const mockItem = {
        replace: jest.fn().mockResolvedValue({ resource: undefined }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.update(mockAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return 404 when author not found during update', async () => {
      const mockItem = {
        replace: jest.fn().mockRejectedValue({ code: 404 }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.update(mockAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Author not found');
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 500 for other update errors', async () => {
      const mockItem = {
        replace: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.update(mockAuthor);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to update author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('delete', () => {
    it('should delete author successfully', async () => {
      const mockItem = {
        delete: jest.fn().mockResolvedValue({}),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.delete('author-123');

      expect(result.success).toBe(true);
      expect(result.data).toBeUndefined();
      expect(mockContainer.item).toHaveBeenCalledWith('author-123', ['author-123', ENTITY_TYPES.AUTHOR]);
    });

    it('should return 404 when author not found during delete', async () => {
      const mockItem = {
        delete: jest.fn().mockRejectedValue({ code: 404 }),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.delete('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Author not found');
      expect(result.statusCode).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return 500 for other delete errors', async () => {
      const mockItem = {
        delete: jest.fn().mockRejectedValue(new Error('Database error')),
      };
      (mockContainer.item as jest.Mock).mockReturnValue(mockItem);

      const result = await repository.delete('author-123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Failed to delete author');
      expect(result.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });
});
