import { ClassifyBookValidator } from './classifyBook.validator';

describe('ClassifyBookValidator', () => {
  describe('Valid inputs', () => {
    it('should pass validation with only Dewey Decimal', () => {
      const dto = {
        deweyDecimal: '813.6',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with only Library of Congress number', () => {
      const dto = {
        libraryOfCongressNumber: 'PZ7.R79835',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with only OCLC number', () => {
      const dto = {
        oclcNumber: '123456789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with all fields', () => {
      const dto = {
        deweyDecimal: '813.6',
        libraryOfCongressNumber: 'PZ7.R79835',
        oclcNumber: '123456789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with multiple fields but not all', () => {
      const dto = {
        deweyDecimal: '813.6',
        oclcNumber: '123456789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });
  });

  describe('Required fields validation', () => {
    it('should fail when no fields are provided', () => {
      const dto = {};
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe(
        'At least one classification field (deweyDecimal, libraryOfCongressNumber, or oclcNumber) must be provided',
      );
    });
  });

  describe('Dewey Decimal validation', () => {
    it('should pass with valid Dewey Decimal with decimal part', () => {
      const dto = {
        deweyDecimal: '813.6',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with Dewey Decimal without decimal part', () => {
      const dto = {
        deweyDecimal: '813',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with Dewey Decimal with multiple decimal places', () => {
      const dto = {
        deweyDecimal: '813.54',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail with invalid Dewey Decimal format (2 digits)', () => {
      const dto = {
        deweyDecimal: '81.3',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
    });

    it('should fail with non-numeric Dewey Decimal', () => {
      const dto = {
        deweyDecimal: 'ABC.123',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
    });

    it('should fail with Dewey Decimal containing special characters', () => {
      const dto = {
        deweyDecimal: '813-6',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
    });
  });

  describe('Library of Congress number validation', () => {
    it('should pass with valid Library of Congress number', () => {
      const dto = {
        libraryOfCongressNumber: 'PZ7.R79835',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with different LOC format', () => {
      const dto = {
        libraryOfCongressNumber: 'PS3568.O243',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when Library of Congress number exceeds 50 characters', () => {
      const dto = {
        libraryOfCongressNumber: 'A'.repeat(51),
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Library of Congress number must be at most 50 characters');
    });
  });

  describe('OCLC number validation', () => {
    it('should pass with valid OCLC number', () => {
      const dto = {
        oclcNumber: '123456789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with long OCLC number', () => {
      const dto = {
        oclcNumber: '1234567890123',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when OCLC number contains non-digits', () => {
      const dto = {
        oclcNumber: '123-456-789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('OCLC number must contain only digits');
    });

    it('should fail when OCLC number contains letters', () => {
      const dto = {
        oclcNumber: '123ABC789',
      };
      const { error } = ClassifyBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('OCLC number must contain only digits');
    });
  });
});
