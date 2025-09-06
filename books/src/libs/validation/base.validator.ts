import { injectable } from 'inversify';
import Joi from 'joi';

import { ValidationResult } from './validationResult.type';

/**
 * Generic base validator abstract class
 *
 * Provides common Joi schema validation logic that all validators can inherit.
 * Feature-specific validators should extend this class and provide their schema.
 *
 * Design principles:
 * - No dependencies on domain entities or repositories
 * - Pure schema-based validation
 * - Reusable across all features
 * - Follows Strategy Pattern with Dependency Injection
 *
 * @template T The type of data to validate
 */
@injectable()
export abstract class BaseValidator<T> {
  /**
   * Joi schema for validation
   * Must be defined by concrete validator implementations
   */
  protected abstract readonly schema: Joi.ObjectSchema<T>;

  /**
   * Validates data against the defined Joi schema
   *
   * @param data The data to validate
   * @returns Promise resolving to ValidationResult
   */
  async validate(data: T): Promise<ValidationResult> {
    const { error } = this.schema.validate(data);

    if (error) {
      return { valid: false, error: new Error(`Validation error: ${error.message}`) };
    }

    return { valid: true };
  }
}
