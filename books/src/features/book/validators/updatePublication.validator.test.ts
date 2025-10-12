import { UpdatePublicationValidator } from './updatePublication.validator';

describe('UpdatePublicationValidator', () => {
  const validUpdatePublicationDto = {
    reason: 'Correcting ISBN due to data entry error during initial publication',
  };

  describe('Valid inputs', () => {
    it('should pass validation with only reason', () => {
      const { error } = UpdatePublicationValidator.validate(validUpdatePublicationDto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with ISBN-13 and reason', () => {
      const dto = {
        isbn: {
          isbn13: '9781234567890',
        },
        reason: 'Correcting ISBN due to publisher change',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with ISBN-10 and reason', () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
        },
        reason: 'Correcting ISBN-10 format',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with both ISBN formats and reason', () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
          isbn13: '9781234567890',
        },
        reason: 'Adding both ISBN formats for completeness',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with all fields', () => {
      const dto = {
        isbn: {
          isbn13: '9781234567890',
        },
        publishedDate: new Date('2025-01-01'),
        copyright: '© 2025 Corrected Publisher',
        edition: '2nd Edition',
        reason: 'Comprehensive correction of publication metadata after publisher review',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with publishedDate in the past', () => {
      const dto = {
        ...validUpdatePublicationDto,
        publishedDate: new Date('2020-01-01'),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });
  });

  describe('Reason validation', () => {
    it('should fail when reason is missing', () => {
      const { reason: _reason, ...dtoWithoutReason } = validUpdatePublicationDto;
      const { error } = UpdatePublicationValidator.validate(dtoWithoutReason);
      expect(error?.details[0].message).toBe('Reason is required when updating publication information');
    });

    it('should fail when reason is empty string', () => {
      const dto = {
        reason: '',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('"reason" is not allowed to be empty');
    });

    it('should fail when reason is less than 10 characters', () => {
      const dto = {
        reason: 'Too short',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Reason must be at least 10 characters to provide meaningful context');
    });

    it('should pass when reason is exactly 10 characters', () => {
      const dto = {
        reason: '1234567890',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass when reason is exactly 500 characters', () => {
      const dto = {
        reason: 'A'.repeat(500),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when reason exceeds 500 characters', () => {
      const dto = {
        reason: 'A'.repeat(501),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Reason must be at most 500 characters');
    });
  });

  describe('ISBN validation', () => {
    it('should fail when ISBN object is empty', () => {
      const dto = {
        isbn: {},
        reason: 'Attempting to provide empty ISBN',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Either isbn10 or isbn13 must be provided');
    });

    it('should fail when ISBN-10 is not exactly 10 digits', () => {
      const dto = {
        isbn: {
          isbn10: '123456789',
        },
        reason: 'Correcting ISBN-10 with invalid format',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-10 must be exactly 10 digits');
    });

    it('should fail when ISBN-10 contains non-numeric characters', () => {
      const dto = {
        isbn: {
          isbn10: '123456789X',
        },
        reason: 'Correcting ISBN-10 with check digit',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-10 must be exactly 10 digits');
    });

    it('should fail when ISBN-13 is not exactly 13 digits', () => {
      const dto = {
        isbn: {
          isbn13: '978123456789',
        },
        reason: 'Correcting ISBN-13 with invalid length',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-13 must be exactly 13 digits');
    });

    it('should fail when ISBN-13 contains non-numeric characters', () => {
      const dto = {
        isbn: {
          isbn13: '978-1234567890',
        },
        reason: 'Correcting ISBN-13 with hyphens',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-13 must be exactly 13 digits');
    });
  });

  describe('Published date validation', () => {
    it('should fail when publishedDate is in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const dto = {
        ...validUpdatePublicationDto,
        publishedDate: futureDate,
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Published date cannot be in the future');
    });

    it('should pass when publishedDate is today', () => {
      const dto = {
        ...validUpdatePublicationDto,
        publishedDate: new Date(),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });
  });

  describe('Copyright validation', () => {
    it('should pass with valid copyright', () => {
      const dto = {
        ...validUpdatePublicationDto,
        copyright: '© 2025 Updated Publisher Name',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with exactly 100 characters', () => {
      const dto = {
        ...validUpdatePublicationDto,
        copyright: 'A'.repeat(100),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when copyright exceeds 100 characters', () => {
      const dto = {
        ...validUpdatePublicationDto,
        copyright: 'A'.repeat(101),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Copyright notice must be at most 100 characters');
    });
  });

  describe('Edition validation', () => {
    it('should pass with valid edition', () => {
      const dto = {
        ...validUpdatePublicationDto,
        edition: '3rd Edition (Revised)',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with exactly 50 characters', () => {
      const dto = {
        ...validUpdatePublicationDto,
        edition: 'A'.repeat(50),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when edition exceeds 50 characters', () => {
      const dto = {
        ...validUpdatePublicationDto,
        edition: 'A'.repeat(51),
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Edition must be at most 50 characters');
    });
  });

  describe('Multiple fields validation', () => {
    it('should pass when updating multiple fields together', () => {
      const dto = {
        isbn: {
          isbn13: '9781234567890',
        },
        publishedDate: new Date('2024-12-01'),
        copyright: '© 2024 Updated Publisher',
        edition: 'Corrected Edition',
        reason: 'Comprehensive update after publisher review and metadata audit',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when multiple fields are valid but reason is missing', () => {
      const dto = {
        isbn: {
          isbn13: '9781234567890',
        },
        publishedDate: new Date('2024-12-01'),
        copyright: '© 2024 Updated Publisher',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('Reason is required when updating publication information');
    });

    it('should fail when reason is valid but another field is invalid', () => {
      const dto = {
        isbn: {
          isbn13: '123',
        },
        reason: 'Attempting to correct ISBN with invalid format',
      };
      const { error } = UpdatePublicationValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-13 must be exactly 13 digits');
    });
  });
});
