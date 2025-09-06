import { ClassifyBookValidator } from './classifyBook.validator';

describe('ClassifyBookValidator', () => {
  let validator: ClassifyBookValidator;

  beforeEach(() => {
    validator = new ClassifyBookValidator();
  });

  describe('Valid inputs', () => {
    it('should pass validation with only Dewey Decimal', async () => {
      const dto = {
        deweyDecimal: '813.6',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with only Library of Congress number', async () => {
      const dto = {
        libraryOfCongressNumber: 'PZ7.R79835',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with only OCLC number', async () => {
      const dto = {
        oclcNumber: '123456789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with all fields', async () => {
      const dto = {
        deweyDecimal: '813.6',
        libraryOfCongressNumber: 'PZ7.R79835',
        oclcNumber: '123456789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with multiple fields but not all', async () => {
      const dto = {
        deweyDecimal: '813.6',
        oclcNumber: '123456789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });
  });

  describe('Required fields validation', () => {
    it('should fail when no fields are provided', async () => {
      const dto = {};
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validator.validate(dto as any);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain(
          'At least one classification field (deweyDecimal, libraryOfCongressNumber, or oclcNumber) must be provided',
        );
      }
    });
  });

  describe('Dewey Decimal validation', () => {
    it('should pass with valid Dewey Decimal with decimal part', async () => {
      const dto = {
        deweyDecimal: '813.6',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with Dewey Decimal without decimal part', async () => {
      const dto = {
        deweyDecimal: '813',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with Dewey Decimal with multiple decimal places', async () => {
      const dto = {
        deweyDecimal: '813.54',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail with invalid Dewey Decimal format (2 digits)', async () => {
      const dto = {
        deweyDecimal: '81.3',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
      }
    });

    it('should fail with non-numeric Dewey Decimal', async () => {
      const dto = {
        deweyDecimal: 'ABC.123',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
      }
    });

    it('should fail with Dewey Decimal containing special characters', async () => {
      const dto = {
        deweyDecimal: '813-6',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Dewey Decimal must be in format XXX.XX (e.g., 813.6)');
      }
    });
  });

  describe('Library of Congress number validation', () => {
    it('should pass with valid Library of Congress number', async () => {
      const dto = {
        libraryOfCongressNumber: 'PZ7.R79835',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with different LOC format', async () => {
      const dto = {
        libraryOfCongressNumber: 'PS3568.O243',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when Library of Congress number exceeds 50 characters', async () => {
      const dto = {
        libraryOfCongressNumber: 'A'.repeat(51),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Library of Congress number must be at most 50 characters');
      }
    });
  });

  describe('OCLC number validation', () => {
    it('should pass with valid OCLC number', async () => {
      const dto = {
        oclcNumber: '123456789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with long OCLC number', async () => {
      const dto = {
        oclcNumber: '1234567890123',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when OCLC number contains non-digits', async () => {
      const dto = {
        oclcNumber: '123-456-789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('OCLC number must contain only digits');
      }
    });

    it('should fail when OCLC number contains letters', async () => {
      const dto = {
        oclcNumber: '123ABC789',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('OCLC number must contain only digits');
      }
    });
  });
});
