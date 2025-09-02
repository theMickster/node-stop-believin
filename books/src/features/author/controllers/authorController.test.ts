import { AuthorController } from './author.controller';
import { Author } from '@data/entities/author.entity';
import { CreateAuthorCommand } from '@features/author/commands/createAuthor.command';
import { ReadAuthorDto } from '@features/author/models/readAuthorDto';
import { ReadAuthorQuery } from '@features/author/queries/readAuthor.query';
import { ReadAuthorListQuery } from '@features/author/queries/readAuthorList.query';
import { fakeAuthors } from '@fixtures/authors';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { commandFail, commandOk } from '@libs/cqrs/commandResult';
import { IQueryHandler } from '@libs/cqrs/queryHandler';
import { queryFail, queryOk } from '@libs/cqrs/queryResult';
import { ErrorCodes, HttpStatus } from '@libs/cqrs/errorCodes';
import { ILogger } from '@libs/logging/logger.interface';
import { Request as ExpressRequest } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import httpMocks from 'node-mocks-http';

describe('AuthorController', () => {
  const mockReadAuthorListHandler = mock<IQueryHandler<ReadAuthorListQuery, ReadAuthorDto[]>>();
  const mockReadAuthorHandler = mock<IQueryHandler<ReadAuthorQuery, ReadAuthorDto | null>>();
  const mockCreateAuthorCommandHandler = mock<ICommandHandler<CreateAuthorCommand, Author>>();
  const mockLogger = mock<ILogger>();

  let sut: AuthorController;

  const createMockRequest = (params: any = {}, body: any = {}, query: any = {}) => {
    const req = httpMocks.createRequest({
      params: params,
      body: body,
      query: query,
    }) as ExpressRequest;
    return req;
  };

  beforeEach(() => {
    mockReset(mockReadAuthorListHandler);
    mockReset(mockReadAuthorHandler);
    mockReset(mockCreateAuthorCommandHandler);
    mockReset(mockLogger);

    sut = new AuthorController(
      mockReadAuthorListHandler,
      mockReadAuthorHandler,
      mockCreateAuthorCommandHandler,
      mockLogger
    );
  });

  describe('getAuthors', () => {
    it('should return a list of authors on success', async () => {
      const mockAuthors: ReadAuthorDto[] = [
        {
          id: fakeAuthors[0].id,
          authorId: fakeAuthors[0].authorId,
          firstName: fakeAuthors[0].firstName,
          lastName: fakeAuthors[0].lastName,
          displayName: fakeAuthors[0].displayName,
          genres: fakeAuthors[0].genres,
          status: fakeAuthors[0].status,
          isVerified: fakeAuthors[0].isVerified,
        },
      ];

      mockReadAuthorListHandler.handle.mockResolvedValue(queryOk(mockAuthors));
      const req = createMockRequest();
      const res = httpMocks.createResponse();

      await sut.getAuthors(req, res);

      expect(mockReadAuthorListHandler.handle).toHaveBeenCalledWith(new ReadAuthorListQuery());
      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toBeInstanceOf(Array);
      expect(responseData.length).toBe(mockAuthors.length);
    });

    it('should return the correct error upon hard exception', async () => {
      mockReadAuthorListHandler.handle.mockResolvedValue(
        queryFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR)
      );
      const req = createMockRequest();
      const res = httpMocks.createResponse();

      await sut.getAuthors(req, res);
      expect(mockReadAuthorListHandler.handle).toHaveBeenCalledWith(new ReadAuthorListQuery());
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ message: 'Failed to list authors' });
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to fetch author list', {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Whoops! There was a Cosmos Error!',
      });
    });
  });

  describe('getAuthorById', () => {
    it('should return the correct author by id', async () => {
      const authorId = '5aa2872a-202c-4d19-9a04-74b4f638275e';
      const mockAuthor: ReadAuthorDto = {
        id: fakeAuthors[0].id,
        authorId: fakeAuthors[0].authorId,
        firstName: fakeAuthors[0].firstName,
        lastName: fakeAuthors[0].lastName,
        displayName: fakeAuthors[0].displayName,
        genres: fakeAuthors[0].genres,
        status: fakeAuthors[0].status,
        isVerified: fakeAuthors[0].isVerified,
      };

      mockReadAuthorHandler.handle.mockResolvedValue(queryOk(mockAuthor));

      const req = createMockRequest({ id: authorId });
      const res = httpMocks.createResponse();

      await sut.getAuthorById(req, res);

      expect(mockReadAuthorHandler.handle).toHaveBeenCalledWith(new ReadAuthorQuery(authorId));
      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual(mockAuthor);
    });

    it('should return correct error when author not found', async () => {
      const authorId = 'c6495368-edc2-4e16-a525-bf6837e38da2';
      mockReadAuthorHandler.handle.mockResolvedValue(queryOk(null));

      const req = createMockRequest({ id: authorId });
      const res = httpMocks.createResponse();

      await sut.getAuthorById(req, res);
      expect(mockReadAuthorHandler.handle).toHaveBeenCalledWith(new ReadAuthorQuery(authorId));
      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ error: 'Author not found' });
      expect(mockLogger.error).toHaveBeenCalledTimes(0);
    });

    it('should return the correct error upon hard exception', async () => {
      const authorId = '911aa084-ad4b-4d16-a0b6-cad5fe2589c6';
      mockReadAuthorHandler.handle.mockResolvedValue(
        queryFail(ErrorCodes.DATABASE_ERROR, 'Whoops! There was a Cosmos Error!', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      const req = createMockRequest({ id: authorId });
      const res = httpMocks.createResponse();

      await sut.getAuthorById(req, res);
      expect(mockReadAuthorHandler.handle).toHaveBeenCalledWith(new ReadAuthorQuery(authorId));
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData).toEqual({ error: 'Failed to retrieve author' });
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to retrieve author', {
        code: ErrorCodes.DATABASE_ERROR,
        message: 'Whoops! There was a Cosmos Error!',
        authorId,
      });
    });
  });

  describe('createAuthor', () => {
    it('should successfully create a new author', async () => {
      const createDto = {
        firstName: 'Stephen',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: ['Horror', 'Thriller'],
        status: 'Active' as const,
        isVerified: true,
      };

      const createdAuthor: Author = {
        ...fakeAuthors[0],
        ...createDto,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(commandOk(createdAuthor));

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const responseData = JSON.parse(res._getData());
      expect(responseData.firstName).toBe('Stephen');
      expect(responseData.lastName).toBe('King');
      expect(responseData.displayName).toBe('Stephen King');
    });

    it('should successfully create an author with all optional fields', async () => {
      const createDto = {
        firstName: 'George',
        middleName: 'R.R.',
        lastName: 'Martin',
        displayName: 'George R.R. Martin',
        pseudonyms: ['GRRM'],
        shortBio: 'Author of A Song of Ice and Fire',
        genres: ['Fantasy', 'Epic Fantasy'],
        email: 'george@example.com',
        website: 'https://georgerrmartin.com',
        socialMedia: {
          twitter: '@GRRMspeaking',
          goodreads: 'georgerrmartin',
        },
        status: 'Active' as const,
        isVerified: true,
      };

      const createdAuthor: Author = {
        ...fakeAuthors[2],
        ...createDto,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(commandOk(createdAuthor));

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.CREATED);
      const responseData = JSON.parse(res._getData());
      expect(responseData.middleName).toBe('R.R.');
      expect(responseData.pseudonyms).toContain('GRRM');
    });

    it('should return validation error when firstName is missing', async () => {
      const createDto = {
        firstName: '',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: ['Horror'],
        status: 'Active' as const,
        isVerified: true,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.VALIDATION_FAILED, 'Validation failed: First name is required', HttpStatus.BAD_REQUEST)
      );

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(responseData.error.message).toContain('First name is required');
    });

    it('should return validation error when genres are empty', async () => {
      const createDto = {
        firstName: 'Stephen',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: [],
        status: 'Active' as const,
        isVerified: true,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(
        commandFail(
          ErrorCodes.VALIDATION_FAILED,
          'Validation failed: At least one genre is required',
          HttpStatus.BAD_REQUEST
        )
      );

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(responseData.error.message).toContain('At least one genre is required');
    });

    it('should return database error when repository fails', async () => {
      const createDto = {
        firstName: 'Stephen',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: ['Horror'],
        status: 'Active' as const,
        isVerified: true,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.DATABASE_ERROR, 'Cosmos DB is down', HttpStatus.INTERNAL_SERVER_ERROR)
      );

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(responseData.error.message).toBe('Cosmos DB is down');
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create author',
        expect.objectContaining({
          code: ErrorCodes.DATABASE_ERROR,
          message: 'Cosmos DB is down',
        })
      );
    });

    it('should return validation error for invalid email', async () => {
      const createDto = {
        firstName: 'Stephen',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: ['Horror'],
        email: 'not-an-email',
        status: 'Active' as const,
        isVerified: true,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(
        commandFail(
          ErrorCodes.VALIDATION_FAILED,
          'Validation failed: Email must be a valid email address',
          HttpStatus.BAD_REQUEST
        )
      );

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(responseData.error.message).toContain('Email must be a valid email address');
    });

    it('should return validation error for invalid status', async () => {
      const createDto = {
        firstName: 'Stephen',
        lastName: 'King',
        displayName: 'Stephen King',
        genres: ['Horror'],
        status: 'InvalidStatus' as any,
        isVerified: true,
      };

      mockCreateAuthorCommandHandler.handle.mockResolvedValue(
        commandFail(ErrorCodes.VALIDATION_FAILED, 'Validation failed: Invalid status', HttpStatus.BAD_REQUEST)
      );

      const req = createMockRequest({}, createDto);
      const res = httpMocks.createResponse();

      await sut.createAuthor(req, res);

      expect(mockCreateAuthorCommandHandler.handle).toHaveBeenCalled();
      expect(res.statusCode).toBe(HttpStatus.BAD_REQUEST);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
    });
  });
});
