import { repoOk, repoFail } from "@data/libs/repoResult";
import { BookRepository } from "@data/repos/bookRepository";
import { DeleteBookValidator } from "./deleteBook.validator";

describe('DeleteBookValidator', () => {
  let sut: DeleteBookValidator;
  let mockRepo: jest.Mocked<BookRepository>;

  beforeEach(() => {
    mockRepo = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    sut = new DeleteBookValidator(mockRepo);
  });

  it('should return true if book exists', async () => {
    mockRepo.getById.mockResolvedValue(
      repoOk({
        id: 'b9223c19-5a6d-4406-bf96-aefbae10746a',
        bookId: 'b9223c19-5a6d-4406-bf96-aefbae10746a',
        name: 'Test Book',
        authors: [],
        entityType: 'Book',
      }),
    );

    const result = await sut.validate('b9223c19-5a6d-4406-bf96-aefbae10746a');
    expect(result).toEqual({ valid: true });
  });

  it('should return false if bookId is missing', async () => {
    const result = await sut.validate('');

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toMatch('Validation error: Book ID must not be empty');
    }
  });

  it('should return false if bookId is invalid guid', async () => {
    const result = await sut.validate('not-a-uuid');

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toMatch('Validation error: Book ID must be a valid guid');
    }
  });

  it('should return false if the book does not exist', async () => {
    mockRepo.getById.mockResolvedValue(repoFail('Not found'));
    
    const result = await sut.validate('b9223c19-5a6d-4406-bf96-aefbae10746a');

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error.message).toMatch('Book not found');
    }
  });
});
