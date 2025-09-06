/**
 * Validation result type
 *
 * Following Railway Oriented Programming pattern:
 * - { valid: true } for successful validation
 * - { valid: false; error: Error } for validation failures
 */
export type ValidationResult = { valid: true } | { valid: false; error: Error };

/**
 * Type guard to check if validation failed
 */
export function isValidationFailure(result: ValidationResult): result is { valid: false; error: Error } {
  return !result.valid;
}

/**
 * Type guard to check if validation succeeded
 */
export function isValidationSuccess(result: ValidationResult): result is { valid: true } {
  return result.valid;
}
