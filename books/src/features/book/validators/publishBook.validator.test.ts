import { PublishBookValidator } from './publishBook.validator';

describe('PublishBookValidator', () => {
  const validPublishBookDto = {
    isbn: {
      isbn13: '9781234567890',
    },
  };

  describe('Valid inputs', () => {
    it('should pass validation with only ISBN-13', () => {
      const { error } = PublishBookValidator.validate(validPublishBookDto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with only ISBN-10', () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with both ISBN-10 and ISBN-13', () => {
      const dto = {
        isbn: {
          isbn10: '1234567890',
          isbn13: '9781234567890',
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass validation with all optional fields', () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        copyright: '© 2025 Publisher',
        firstPublishedDate: new Date('2025-01-01'),
        edition: '1st Edition',
        bisacCodes: ['JUV037000', 'FIC009000'],
        thema: ['YFB', 'YFD'],
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with publishedDate in the past', () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2020-01-01'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });
  });

  describe('ISBN validation', () => {
    it('should fail when ISBN is missing', () => {
      const { isbn: _isbn, ...dtoWithoutIsbn } = validPublishBookDto;
      const { error } = PublishBookValidator.validate(dtoWithoutIsbn);
      expect(error?.details[0].message).toBe('ISBN is required to publish a book');
    });

    it('should fail when ISBN object is empty', () => {
      const dto = {
        isbn: {},
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Either isbn10 or isbn13 must be provided');
    });

    it('should fail when ISBN-10 is not exactly 10 digits', () => {
      const dto = {
        isbn: {
          isbn10: '123456789', // 9 digits
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-10 must be exactly 10 digits');
    });

    it('should fail when ISBN-10 contains non-numeric characters', () => {
      const dto = {
        isbn: {
          isbn10: '123456789X',
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-10 must be exactly 10 digits');
    });

    it('should fail when ISBN-13 is not exactly 13 digits', () => {
      const dto = {
        isbn: {
          isbn13: '978123456789', // 12 digits
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-13 must be exactly 13 digits');
    });

    it('should fail when ISBN-13 contains non-numeric characters', () => {
      const dto = {
        isbn: {
          isbn13: '978-1234567890',
        },
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('ISBN-13 must be exactly 13 digits');
    });
  });

  describe('Published date validation', () => {
    it('should fail when publishedDate is in the future', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      const dto = {
        ...validPublishBookDto,
        publishedDate: futureDate,
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Published date cannot be in the future');
    });

    it('should fail when firstPublishedDate is after publishedDate', () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        firstPublishedDate: new Date('2025-06-01'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('First published date cannot be after published date');
    });

    it('should pass when firstPublishedDate equals publishedDate', () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-01-01'),
        firstPublishedDate: new Date('2025-01-01'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass when firstPublishedDate is before publishedDate', () => {
      const dto = {
        ...validPublishBookDto,
        publishedDate: new Date('2025-06-01'),
        firstPublishedDate: new Date('2020-01-01'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });
  });

  describe('Copyright validation', () => {
    it('should pass with valid copyright', () => {
      const dto = {
        ...validPublishBookDto,
        copyright: '© 2025 Publisher Name',
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when copyright exceeds 100 characters', () => {
      const dto = {
        ...validPublishBookDto,
        copyright: 'A'.repeat(101),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Copyright notice must be at most 100 characters');
    });
  });

  describe('Edition validation', () => {
    it('should pass with valid edition', () => {
      const dto = {
        ...validPublishBookDto,
        edition: '2nd Edition',
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when edition exceeds 50 characters', () => {
      const dto = {
        ...validPublishBookDto,
        edition: 'A'.repeat(51),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Edition must be at most 50 characters');
    });
  });

  describe('BISAC codes validation', () => {
    it('should pass with valid BISAC codes array', () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: ['JUV037000', 'FIC009000'],
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with empty BISAC codes array', () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: [],
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when BISAC codes exceed 10 items', () => {
      const dto = {
        ...validPublishBookDto,
        bisacCodes: Array(11).fill('CODE'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Maximum 10 BISAC codes allowed');
    });
  });

  describe('Thema codes validation', () => {
    it('should pass with valid Thema codes array', () => {
      const dto = {
        ...validPublishBookDto,
        thema: ['YFB', 'YFD'],
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should pass with empty Thema codes array', () => {
      const dto = {
        ...validPublishBookDto,
        thema: [],
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error).toBeUndefined();
    });

    it('should fail when Thema codes exceed 10 items', () => {
      const dto = {
        ...validPublishBookDto,
        thema: Array(11).fill('CODE'),
      };
      const { error } = PublishBookValidator.validate(dto);
      expect(error?.details[0].message).toBe('Maximum 10 Thema codes allowed');
    });
  });
});
