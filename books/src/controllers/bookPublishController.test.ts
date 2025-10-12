import { BookPublishController } from '@controllers/bookPublish.controller';
import { Book } from '@data/entities/book.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';
import { PublishBookCommand } from '@features/book/commands/publishBook.command';
import { UpdatePublicationCommand } from '@features/book/commands/updatePublication.command';
import { PublishBookDto } from '@features/book/models/publishBookDto';
import { UpdatePublicationDto } from '@features/book/models/updatePublicationDto';
import { ICommandHandler } from '@libs/cqrs/commandHandler';
import { ILogger } from '@libs/logging/logger.interface';
import { Request } from 'express';
import { mock, mockReset } from 'jest-mock-extended';
import httpMocks from 'node-mocks-http';

describe('BookPublishController', () => {
  const mockPublishBookCommandHandler = mock<ICommandHandler<PublishBookCommand, Book>>();
  const mockUpdatePublicationCommandHandler = mock<ICommandHandler<UpdatePublicationCommand, Book>>();
  const mockLogger = mock<ILogger>();

  let sut: BookPublishController;

  const createMockPublishRequest = (params: { id: string }, body: PublishBookDto) => {
    return httpMocks.createRequest({
      params,
      body,
    }) as Request<{ id: string }, object, PublishBookDto>;
  };

  const createMockUpdateRequest = (params: { id: string }, body: UpdatePublicationDto) => {
    return httpMocks.createRequest({
      params,
      body,
    }) as Request<{ id: string }, object, UpdatePublicationDto>;
  };

  beforeEach(() => {
    mockReset(mockPublishBookCommandHandler);
    mockReset(mockUpdatePublicationCommandHandler);
    mockReset(mockLogger);

    sut = new BookPublishController(
      mockPublishBookCommandHandler,
      mockUpdatePublicationCommandHandler,
      mockLogger
    );
  });

  describe('publishBook', () => {
    const bookId = '41ca7c11-87d8-4d18-b210-74099094ec31';
    const publishBookDto: PublishBookDto = {
      isbn: {
        isbn13: '9781234567890',
      },
      publishedDate: new Date('2025-01-15'),
      edition: '1st Edition',
      copyright: '© 2025 Test Publisher',
    };

    const publishedBook: Book = {
      id: bookId,
      bookId: bookId,
      entityType: ENTITY_TYPES.BOOK,
      name: 'Test Book',
      authors: [{ authorId: '123', firstName: 'John', lastName: 'Doe', order: 1 }],
      isbn: { isbn13: '9781234567890' },
      publishedDate: new Date('2025-01-15'),
      firstPublishedDate: new Date('2025-01-15'),
      edition: '1st Edition',
      copyright: '© 2025 Test Publisher',
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2025-01-15'),
      updatedBy: 'system',
      isDeleted: false,
      version: 2,
    };

    it('should publish a book successfully', async () => {
      mockPublishBookCommandHandler.handle.mockResolvedValue(publishedBook);
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(mockPublishBookCommandHandler.handle).toHaveBeenCalledWith(
        new PublishBookCommand(bookId, publishBookDto)
      );
      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.isbn).toEqual({ isbn13: '9781234567890' });
      expect(responseData.edition).toBe('1st Edition');
    });

    it('should return 409 when book is already published', async () => {
      mockPublishBookCommandHandler.handle.mockRejectedValue(
        new Error('Book is already published. Use update-publication endpoint to correct publication details.')
      );
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(mockPublishBookCommandHandler.handle).toHaveBeenCalledWith(
        new PublishBookCommand(bookId, publishBookDto)
      );
      expect(res.statusCode).toBe(409);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('already published');
    });

    it('should return 409 when ISBN is already assigned to another book', async () => {
      mockPublishBookCommandHandler.handle.mockRejectedValue(
        new Error('ISBN 9781234567890 is already assigned to another book')
      );
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(mockPublishBookCommandHandler.handle).toHaveBeenCalledWith(
        new PublishBookCommand(bookId, publishBookDto)
      );
      expect(res.statusCode).toBe(409);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('ISBN');
      expect(responseData.error).toContain('already assigned');
    });

    it('should return 404 when book is not found', async () => {
      mockPublishBookCommandHandler.handle.mockRejectedValue(new Error('Book not found'));
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(mockPublishBookCommandHandler.handle).toHaveBeenCalledWith(
        new PublishBookCommand(bookId, publishBookDto)
      );
      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Book not found');
    });

    it('should return 500 on general error', async () => {
      mockPublishBookCommandHandler.handle.mockRejectedValue(new Error('Database connection failed'));
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(mockPublishBookCommandHandler.handle).toHaveBeenCalledWith(
        new PublishBookCommand(bookId, publishBookDto)
      );
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to publish book');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to publish book', {
        error: 'Database connection failed',
        bookId,
      });
    });

    it('should return 500 on validation error', async () => {
      mockPublishBookCommandHandler.handle.mockRejectedValue(
        new Error('Validation failed: ISBN is required to publish a book')
      );
      const req = createMockPublishRequest({ id: bookId }, publishBookDto);
      const res = httpMocks.createResponse();

      await sut.publishBook(req, res);

      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to publish book');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to publish book', {
        error: 'Validation failed: ISBN is required to publish a book',
        bookId,
      });
    });
  });

  describe('updatePublication', () => {
    const bookId = 'b9223c19-5a6d-4406-bf96-aefbae10746a';
    const updatePublicationDto: UpdatePublicationDto = {
      isbn: {
        isbn13: '9780987654321',
      },
      copyright: '© 2025 Updated Publisher',
      reason: 'Correcting ISBN due to data entry error during initial publication',
    };

    const updatedBook: Book = {
      id: bookId,
      bookId: bookId,
      entityType: ENTITY_TYPES.BOOK,
      name: 'Test Book',
      authors: [{ authorId: '456', firstName: 'Jane', lastName: 'Smith', order: 1 }],
      isbn: { isbn13: '9780987654321' },
      publishedDate: new Date('2024-12-01'),
      firstPublishedDate: new Date('2024-12-01'),
      edition: '1st Edition',
      copyright: '© 2025 Updated Publisher',
      createdAt: new Date('2024-01-01'),
      createdBy: 'test-user',
      updatedAt: new Date('2025-01-20'),
      updatedBy: 'system',
      isDeleted: false,
      version: 3,
    };

    it('should update publication information successfully', async () => {
      mockUpdatePublicationCommandHandler.handle.mockResolvedValue(updatedBook);
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(mockUpdatePublicationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdatePublicationCommand(bookId, updatePublicationDto)
      );
      expect(res.statusCode).toBe(200);
      const responseData = JSON.parse(res._getData());
      expect(responseData.isbn).toEqual({ isbn13: '9780987654321' });
      expect(responseData.copyright).toBe('© 2025 Updated Publisher');
    });

    it('should return 400 when book has not been published yet', async () => {
      mockUpdatePublicationCommandHandler.handle.mockRejectedValue(
        new Error('Cannot update publication information for a book that has not been published yet')
      );
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(mockUpdatePublicationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdatePublicationCommand(bookId, updatePublicationDto)
      );
      expect(res.statusCode).toBe(400);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('not been published yet');
    });

    it('should return 409 when new ISBN is already assigned to another book', async () => {
      mockUpdatePublicationCommandHandler.handle.mockRejectedValue(
        new Error('ISBN 9780987654321 is already assigned to another book')
      );
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(mockUpdatePublicationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdatePublicationCommand(bookId, updatePublicationDto)
      );
      expect(res.statusCode).toBe(409);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toContain('ISBN');
      expect(responseData.error).toContain('already assigned');
    });

    it('should return 404 when book is not found', async () => {
      mockUpdatePublicationCommandHandler.handle.mockRejectedValue(new Error('Book not found'));
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(mockUpdatePublicationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdatePublicationCommand(bookId, updatePublicationDto)
      );
      expect(res.statusCode).toBe(404);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Book not found');
    });

    it('should return 500 on general error', async () => {
      mockUpdatePublicationCommandHandler.handle.mockRejectedValue(new Error('Database connection failed'));
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(mockUpdatePublicationCommandHandler.handle).toHaveBeenCalledWith(
        new UpdatePublicationCommand(bookId, updatePublicationDto)
      );
      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to update publication details');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to update publication', {
        error: 'Database connection failed',
        bookId,
      });
    });

    it('should return 500 on validation error for missing reason', async () => {
      mockUpdatePublicationCommandHandler.handle.mockRejectedValue(
        new Error('Validation failed: Reason is required when updating publication information')
      );
      const req = createMockUpdateRequest({ id: bookId }, updatePublicationDto);
      const res = httpMocks.createResponse();

      await sut.updatePublication(req, res);

      expect(res.statusCode).toBe(500);
      const responseData = JSON.parse(res._getData());
      expect(responseData.error).toBe('Failed to update publication details');
      expect(mockLogger.error).toHaveBeenCalledWith('Failed to update publication', {
        error: 'Validation failed: Reason is required when updating publication information',
        bookId,
      });
    });
  });
});
