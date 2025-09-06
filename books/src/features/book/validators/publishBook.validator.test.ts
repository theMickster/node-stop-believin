import { PublishBookValidator } from './publishBook.validator';

describe('PublishBookValidator', () => {
  let validator: PublishBookValidator;

  const validPublishBookDto = {
    isbn: {
      isbn13: '9781234567890',
    },
  };

  beforeEach(() => {
    validator = new PublishBookValidator();
  });

  describe('Valid inputs', () => {
    it('should pass validation with only ISBN-13', async () => {
      const result = await validator.validate(validPublishBookDto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with only ISBN-10', async () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with both ISBN-10 and ISBN-13', async () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
          isbn13: '9781234567890',
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass validation with all optional fields', async () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        copyright: '© 2025 Publisher',
        firstPublishedDate: new Date('2025-01-01'),
        edition: '1st Edition',
        bisacCodes: ['JUV037000', 'FIC009000'],
        thema: ['YFB', 'YFD'],
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with publishedDate in the past', async () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2020-01-01'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });
  });

  describe('ISBN validation', () => {
    it('should fail when ISBN is missing', async () => {
      const { isbn: _isbn, ...dtoWithoutIsbn } = validPublishBookDto;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await validator.validate(dtoWithoutIsbn as any);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('ISBN is required to publish a book');
      }
    });

    it('should fail when ISBN object is empty', async () => {
      const dto = {
        isbn: {},
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Either isbn10 or isbn13 must be provided');
      }
    });

    it('should fail when ISBN-10 is not exactly 10 digits', async () => {
      const dto = {
        isbn: {
          isbn10: '123456789', // 9 digits
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('ISBN-10 must be exactly 10 digits');
      }
    });

    it('should fail when ISBN-10 contains non-numeric characters', async () => {
      const dto = {
        isbn: {
          isbn10: '123456789X',
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('ISBN-10 must be exactly 10 digits');
      }
    });

    it('should fail when ISBN-13 is not exactly 13 digits', async () => {
      const dto = {
        isbn: {
          isbn13: '978123456789', // 12 digits
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('ISBN-13 must be exactly 13 digits');
      }
    });

    it('should fail when ISBN-13 contains non-numeric characters', async () => {
      const dto = {
        isbn: {
          isbn13: '978-1234567890',
        },
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('ISBN-13 must be exactly 13 digits');
      }
    });
  });

  describe('Published date validation', () => {
    it('should fail when publishedDate is in the future', async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const dto = {
        ...validPublishBookDto,
        publishedDate: futureDate,
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Published date cannot be in the future');
      }
    });

    it('should fail when firstPublishedDate is after publishedDate', async () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        firstPublishedDate: new Date('2025-06-01'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('First published date cannot be after published date');
      }
    });

    it('should pass when firstPublishedDate equals publishedDate', async () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        firstPublishedDate: new Date('2025-01-01'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass when firstPublishedDate is before publishedDate', async () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-06-01'),
        firstPublishedDate: new Date('2020-01-01'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });
  });

  describe('Copyright validation', () => {
    it('should pass with valid copyright', async () => {
      const dto = {
        ...validPublishBookDto,
        copyright: '© 2025 Publisher Name',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when copyright exceeds 100 characters', async () => {
      const dto = {
        ...validPublishBookDto,
        copyright: 'A'.repeat(101),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Copyright notice must be at most 100 characters');
      }
    });
  });

  describe('Edition validation', () => {
    it('should pass with valid edition', async () => {
      const dto = {
        ...validPublishBookDto,
        edition: '2nd Edition',
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when edition exceeds 50 characters', async () => {
      const dto = {
        ...validPublishBookDto,
        edition: 'A'.repeat(51),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Edition must be at most 50 characters');
      }
    });
  });

  describe('BISAC codes validation', () => {
    it('should pass with valid BISAC codes array', async () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: ['JUV037000', 'FIC009000'],
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with empty BISAC codes array', async () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: [],
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when BISAC codes exceed 10 items', async () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: Array(11).fill('CODE'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Maximum 10 BISAC codes allowed');
      }
    });
  });

  describe('Thema codes validation', () => {
    it('should pass with valid Thema codes array', async () => {
      const dto = {
        ...validPublishBookDto,
        thema: ['YFB', 'YFD'],
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should pass with empty Thema codes array', async () => {
      const dto = {
        ...validPublishBookDto,
        thema: [],
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(true);
    });

    it('should fail when Thema codes exceed 10 items', async () => {
      const dto = {
        ...validPublishBookDto,
        thema: Array(11).fill('CODE'),
      };
      const result = await validator.validate(dto);
      expect(result.valid).toBe(false);
      if (!result.valid) {
        expect(result.error.message).toContain('Maximum 10 Thema codes allowed');
      }
    });
  });
});
