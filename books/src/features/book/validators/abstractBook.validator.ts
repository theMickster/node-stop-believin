import { injectable } from 'inversify';

import { BaseValidator } from '@libs/validation/base.validator';
import { ValidationResult } from '@libs/validation/validationResult.type';

import { BookRepository } from '@data/repos/book.repository';

/**
 * Abstract base validator for Book feature
 *
 * Extends the generic BaseValidator and adds Book-specific domain validation.
 * Provides common Book validation logic like existence checks.
 *
 * Concrete Book validators should extend this class to inherit:
 * - Joi schema validation (from BaseValidator)
 * - Book existence validation (from AbstractBookValidator)
 *
 * @template T The type of data to validate
 */
@injectable()
export abstract class AbstractBookValidator<T> extends BaseValidator<T> {
  constructor(protected readonly bookRepository: BookRepository) {
    super();
  }

  /**
   * Validates that a book exists in the repository
   *
   * @param bookId The ID of the book to check
   * @returns Promise resolving to ValidationResult
   */
  protected async validateBookExists(bookId: string): Promise<ValidationResult> {
    const result = await this.bookRepository.getById(bookId);
    if (!result.success || !result.data) {
      return { valid: false, error: new Error('Book not found') };
    }
    return { valid: true };
  }
}
