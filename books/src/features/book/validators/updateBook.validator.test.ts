import { BookRepository } from '@data/repos/bookRepository';
import { UpdateBookValidator } from './updateBook.validator';
import { UpdateBookDto } from '../models/updateBookDto';

describe('UpdateBookValidator', () => {
  let sut: UpdateBookValidator;
  let mockRepo: jest.Mocked<BookRepository>;
  const validBookId = '8a9b1e90-cb87-4d5a-9b35-b0c1d4e984c9';

  beforeEach(() => {
    mockRepo = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    mockRepo.getById.mockResolvedValue({
      success: true,
      data: {
        id: validBookId,
        bookId: validBookId,
        name: 'Sample Book',
        entityType: 'book',
        authors: [],
      },
    });
    sut = new UpdateBookValidator(mockRepo);
  });

  it('should validate successfully with a full valid DTO when the book exists', async () => {
    const dto: UpdateBookDto = {
      id: validBookId,    
      name: 'Updated Title',
      authors: [{ authorId: '44452d4e-7feb-49f3-846e-585431a7aa49' , firstName: 'Alice', lastName: 'Smith' }],
    };
    const result = await sut.validate(dto);
    expect(result.valid).toBe(true);
  });
});
