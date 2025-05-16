import { BookRepository } from '@data/repos/bookRepository';

export abstract class AbstractBookValidator<T> {
  constructor(protected readonly bookRepository: BookRepository) {}

  protected async validateBookExists(bookId: string): Promise<{ valid: true } | { valid: false; error: Error }> {
    const result = await this.bookRepository.getById(bookId);
    if (!result.success || !result.data) {
      return { valid: false, error: new Error('Book not found') };
    }
    return { valid: true };
  }

  public abstract validate(dto: T): Promise<{ valid: true } | { valid: false; error: Error }>;
}