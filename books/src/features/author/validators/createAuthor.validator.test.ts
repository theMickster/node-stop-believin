import { CreateAuthorValidator } from './createAuthor.validator';

describe('CreateAuthorValidator', () => {
  const validAuthor = {
    firstName: 'John',
    lastName: 'Doe',
    displayName: 'John Doe',
    genres: ['Fiction', 'Mystery'],
    status: 'Active' as const,
    isVerified: true,
  };

  it('should pass validation for a valid author object', () => {
    const { error } = CreateAuthorValidator.validate(validAuthor);
    expect(error).toBeUndefined();
  });

  it('should fail when firstName is missing', () => {
    const author = { ...validAuthor, firstName: '' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('First name is required');
  });

  it('should fail when firstName is too short', () => {
    const author = { ...validAuthor, firstName: 'J' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('First name must be at least 2 characters');
  });

  it('should fail when lastName is missing', () => {
    const author = { ...validAuthor, lastName: '' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Last name is required');
  });

  it('should fail when lastName is too short', () => {
    const author = { ...validAuthor, lastName: 'D' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Last name must be at least 2 characters');
  });

  it('should fail when displayName is missing', () => {
    const author = { ...validAuthor, displayName: '' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Display name is required');
  });

  it('should fail when displayName is too short', () => {
    const author = { ...validAuthor, displayName: 'J' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Display name must be at least 2 characters');
  });

  it('should fail when genres array is missing', () => {
    const { genres: _genres, ...authorWithoutGenres } = validAuthor;
    const { error } = CreateAuthorValidator.validate(authorWithoutGenres);
    expect(error?.details[0].message).toBe('Genres are required');
  });

  it('should fail when genres array is empty', () => {
    const author = { ...validAuthor, genres: [] };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('At least one genre is required');
  });

  it('should fail when status is missing', () => {
    const { status: _status, ...authorWithoutStatus } = validAuthor;
    const { error } = CreateAuthorValidator.validate(authorWithoutStatus);
    expect(error?.details[0].message).toBe('Status is required');
  });

  it('should fail when status is invalid', () => {
    const author = { ...validAuthor, status: 'InvalidStatus' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Status must be one of: Active, Retired, Deceased, Inactive');
  });

  it('should pass with valid status values', () => {
    const statuses = ['Active', 'Retired', 'Deceased', 'Inactive'];
    statuses.forEach((status) => {
      const author = { ...validAuthor, status };
      const { error } = CreateAuthorValidator.validate(author);
      expect(error).toBeUndefined();
    });
  });

  it('should fail when isVerified is missing', () => {
    const { isVerified: _isVerified, ...authorWithoutVerified } = validAuthor;
    const { error } = CreateAuthorValidator.validate(authorWithoutVerified);
    expect(error?.details[0].message).toBe('Verification status is required');
  });

  it('should pass with optional middleName', () => {
    const author = { ...validAuthor, middleName: 'Michael' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with optional pseudonyms array', () => {
    const author = { ...validAuthor, pseudonyms: ['Johnny', 'JD'] };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with optional suffix', () => {
    const author = { ...validAuthor, suffix: 'Jr.' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with valid shortBio', () => {
    const author = { ...validAuthor, shortBio: 'A great author with many books.' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should fail when shortBio exceeds 500 characters', () => {
    const author = { ...validAuthor, shortBio: 'a'.repeat(501) };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Short bio must not exceed 500 characters');
  });

  it('should pass with valid longBio', () => {
    const author = { ...validAuthor, longBio: 'A very long biography of the author...' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with valid email', () => {
    const author = { ...validAuthor, email: 'john.doe@example.com' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid email', () => {
    const author = { ...validAuthor, email: 'not-an-email' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Email must be a valid email address');
  });

  it('should pass with valid website URL', () => {
    const author = { ...validAuthor, website: 'https://johndoe.com' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid website URL', () => {
    const author = { ...validAuthor, website: 'not-a-url' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Website must be a valid URL');
  });

  it('should pass with valid socialMedia object', () => {
    const author = {
      ...validAuthor,
      socialMedia: {
        twitter: '@johndoe',
        instagram: 'johndoe',
        goodreads: 'john-doe',
      },
    };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with all socialMedia fields', () => {
    const author = {
      ...validAuthor,
      socialMedia: {
        twitter: '@johndoe',
        instagram: 'johndoe',
        facebook: 'john.doe',
        linkedin: 'johndoe',
        goodreads: 'john-doe',
        amazonAuthor: 'John-Doe',
      },
    };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with valid profilePhotoUrl', () => {
    const author = { ...validAuthor, profilePhotoUrl: 'https://example.com/photo.jpg' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid profilePhotoUrl', () => {
    const author = { ...validAuthor, profilePhotoUrl: 'not-a-url' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Profile photo URL must be a valid URL');
  });

  it('should pass with valid bannerImageUrl', () => {
    const author = { ...validAuthor, bannerImageUrl: 'https://example.com/banner.jpg' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should fail with invalid bannerImageUrl', () => {
    const author = { ...validAuthor, bannerImageUrl: 'not-a-url' };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error?.details[0].message).toBe('Banner image URL must be a valid URL');
  });

  it('should pass with valid photoGallery array', () => {
    const author = {
      ...validAuthor,
      photoGallery: ['https://example.com/photo1.jpg', 'https://example.com/photo2.jpg'],
    };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });

  it('should pass with all optional fields populated', () => {
    const author = {
      ...validAuthor,
      middleName: 'Michael',
      pseudonyms: ['Johnny', 'JD'],
      suffix: 'Jr.',
      shortBio: 'A brief bio',
      longBio: 'A very long biography',
      email: 'john@example.com',
      website: 'https://johndoe.com',
      socialMedia: {
        twitter: '@johndoe',
        instagram: 'johndoe',
      },
      profilePhotoUrl: 'https://example.com/photo.jpg',
      bannerImageUrl: 'https://example.com/banner.jpg',
      photoGallery: ['https://example.com/photo1.jpg'],
    };
    const { error } = CreateAuthorValidator.validate(author);
    expect(error).toBeUndefined();
  });
});
