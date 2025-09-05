import { buildAuthorRepoMock } from '@tests/builders/authorRepositoryMockBuilder';
import { buildMockExecutionContext } from '@tests/builders/executionContextMockBuilder';
import { mock, mockReset } from 'jest-mock-extended';

import { isCommandFail, isCommandOk } from '@libs/cqrs/commandResult';
import { ErrorCodes } from '@libs/cqrs/errorCodes';
import { HttpStatus } from '@libs/cqrs/httpStatusCodes';

import { Author } from '@data/entities/author.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { AuthorRepository } from '@data/repos/author.repository';

import { CreateAuthorCommand } from './createAuthor.command';
import { CreateAuthorCommandHandler } from './createAuthor.command.handler';

describe('CreateAuthorCommandHandler', () => {
  const mockRepo = mock<AuthorRepository>();
  const mockContext = buildMockExecutionContext().withUserId('system').withTimestamp(new Date('2024-01-01')).build();
  let sut: CreateAuthorCommandHandler;

  beforeEach(() => {
    mockReset(mockRepo);
    sut = new CreateAuthorCommandHandler(mockRepo);
  });

  it('should successfully create a new author', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror', 'Thriller'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const fakeAuthor: Author = {
      id: '5aa2872a-202c-4d19-9a04-74b4f638275e',
      authorId: '5aa2872a-202c-4d19-9a04-74b4f638275e',
      entityType: ENTITY_TYPES.AUTHOR,
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror', 'Thriller'],
      status: 'Active',
      isVerified: true,
      createdAt: new Date('2024-01-01'),
      createdBy: 'system',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'system',
      isDeleted: false,
      version: 1,
    };
    buildAuthorRepoMock(mockRepo).createReturns(fakeAuthor);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(isCommandOk(result)).toBe(true);

    if (isCommandOk(result)) {
      expect(result.data).toEqual(fakeAuthor);
    }
  });

  it('should successfully create an author with all optional fields', async () => {
    const dto = {
      firstName: 'George',
      middleName: 'R.R.',
      lastName: 'Martin',
      displayName: 'George R.R. Martin',
      pseudonyms: ['GRRM'],
      suffix: '',
      shortBio: 'Author of A Song of Ice and Fire',
      longBio: 'George Raymond Richard Martin is an American novelist...',
      genres: ['Fantasy', 'Epic Fantasy'],
      email: 'george@example.com',
      website: 'https://georgerrmartin.com',
      socialMedia: {
        twitter: '@GRRMspeaking',
        goodreads: 'georgerrmartin',
      },
      profilePhotoUrl: 'https://example.com/photo.jpg',
      bannerImageUrl: 'https://example.com/banner.jpg',
      photoGallery: ['https://example.com/photo1.jpg'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const fakeAuthor: Author = {
      id: 'fdd96c5d-3c69-4e58-a23e-41c18d93f8bc',
      authorId: 'fdd96c5d-3c69-4e58-a23e-41c18d93f8bc',
      entityType: ENTITY_TYPES.AUTHOR,
      ...dto,
      createdAt: new Date('2024-01-01'),
      createdBy: 'system',
      updatedAt: new Date('2024-01-01'),
      updatedBy: 'system',
      isDeleted: false,
      version: 1,
    };
    buildAuthorRepoMock(mockRepo).createReturns(fakeAuthor);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(isCommandOk(result)).toBe(true);

    if (isCommandOk(result)) {
      expect(result.data.firstName).toBe('George');
      expect(result.data.middleName).toBe('R.R.');
      expect(result.data.pseudonyms).toContain('GRRM');
    }
  });

  it('should return CommandResult with error when firstName is missing', async () => {
    const dto = {
      firstName: '',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('First name is required');
    }
  });

  it('should return CommandResult with error when lastName is missing', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: '',
      displayName: 'Stephen King',
      genres: ['Horror'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('Last name is required');
    }
  });

  it('should return CommandResult with error when displayName is missing', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: '',
      genres: ['Horror'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('Display name is required');
    }
  });

  it('should return CommandResult with error when genres array is empty', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: [],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('At least one genre is required');
    }
  });

  it('should return CommandResult with error when status is invalid', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror'],
      status: 'InvalidStatus' as never,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
    }
  });

  it('should return CommandResult with error when email is invalid', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror'],
      email: 'not-an-email',
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).not.toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.VALIDATION_FAILED);
      expect(result.error.message).toContain('Email must be a valid email address');
    }
  });

  it('should return CommandResult with error when repository returns a failure', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror', 'Thriller'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);
    buildAuthorRepoMock(mockRepo).createFails('Cosmos DB is down', HttpStatus.INTERNAL_SERVER_ERROR);

    const result = await sut.handle(cmd);

    expect(mockRepo.create).toHaveBeenCalled();
    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.code).toBe(ErrorCodes.DATABASE_ERROR);
      expect(result.error.message).toBe('Cosmos DB is down');
    }
  });

  it('should return CommandResult with generic error when repo fails without error text', async () => {
    const dto = {
      firstName: 'Stephen',
      lastName: 'King',
      displayName: 'Stephen King',
      genres: ['Horror'],
      status: 'Active' as const,
      isVerified: true,
    };
    const cmd = new CreateAuthorCommand(dto, mockContext);
    mockRepo.create.mockResolvedValue({ success: false, statusCode: HttpStatus.INTERNAL_SERVER_ERROR });

    const result = await sut.handle(cmd);

    expect(isCommandFail(result)).toBe(true);

    if (isCommandFail(result)) {
      expect(result.error.message).toBe('Unknown error creating author');
    }
  });
});
