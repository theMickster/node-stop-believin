import { BookRepository } from '@data/repos/bookRepository';
import { UpdateBookValidator } from './updateBook.validator';
import { UpdateBookDto } from '../models/updateBookDto';

describe('UpdateBookValidator', () => {
  let sut: UpdateBookValidator;
  let mockBookRepository: jest.Mocked<BookRepository>;
  const validBookId = '8a9b1e90-cb87-4d5a-9b35-b0c1d4e984c9';

  beforeEach(() => {
    mockBookRepository = {
      getById: jest.fn(),
    } as unknown as jest.Mocked<BookRepository>;

    mockBookRepository.getById.mockResolvedValue({
      success: true,
      data: {
        id: validBookId,
        bookId: validBookId,
        name: 'Sample Book',
        entityType: 'book',
        authors: [],
      },
    });
    sut = new UpdateBookValidator(mockBookRepository);
  });

  it('should return true when model is valid', async () => {
    const dto: UpdateBookDto = {
      id: validBookId,
      name: 'Updated Title',
      authors: [{ authorId: '44452d4e-7feb-49f3-846e-585431a7aa49', firstName: 'Alice', lastName: 'Smith' }],
    };
    const result = await sut.validate(dto);
    expect(result.valid).toBe(true);
  });

  it('should fail validation when an invalid GUID is provided', async () => {
    const dto: UpdateBookDto = {
      id: 'invalid-uuid',
      name: 'Updated Title',
      authors: [{ authorId: '44452d4e-7feb-49f3-846e-585431a7aa49', firstName: 'Alice', lastName: 'Smith' }],
    };
    const result = await sut.validate(dto);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error?.message).toContain('Validation error:');
    }
  });

  it('should fail validation when name is empty', async () => {
    const dto: UpdateBookDto = {
      id: validBookId,
      name: '',
      authors: [{ authorId: '44452d4e-7feb-49f3-846e-585431a7aa49', firstName: 'Alice', lastName: 'Smith' }],
    };
    const result = await sut.validate(dto);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error?.message).toContain('Validation error:');
    }
  });

    it('should fail validation if the book does not exist', async () => {
    (mockBookRepository.getById as jest.Mock).mockResolvedValue({ success: true, data: null });
    const dto: UpdateBookDto = { id: validBookId, name: "Updated Title",authors: [{ authorId: "44452d4e-7feb-49f3-846e-585431a7aa49", firstName: "Alice", lastName: "Smith" }] };
    
    const result = await sut.validate(dto);
    expect(result.valid).toBe(false);
    if (!result.valid) {
        expect(result.error?.message).toBe("Book not found");
    }
  });
});
