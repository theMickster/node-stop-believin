import { ExecutionContext } from '@middleware/requestContext';

import { Author } from '@data/entities/author.entity';
import { ENTITY_TYPES } from '@data/entities/base/entity-types';

import { CreateAuthorDto } from '@features/author/models/createAuthorDto';
import { ReadAuthorDto, SocialMediaDto } from '@features/author/models/readAuthorDto';

const AUTHOR_ENTITY_TYPE = ENTITY_TYPES.AUTHOR;

/**
 * Helper function to build SocialMediaDto from Author entity
 * Returns undefined if no social media links exist
 */
function buildSocialMedia(author: Author): SocialMediaDto | undefined {
  if (!author.socialMedia) {
    return undefined;
  }

  return {
    ...(author.socialMedia.twitter && { twitter: author.socialMedia.twitter }),
    ...(author.socialMedia.instagram && { instagram: author.socialMedia.instagram }),
    ...(author.socialMedia.facebook && { facebook: author.socialMedia.facebook }),
    ...(author.socialMedia.linkedin && { linkedin: author.socialMedia.linkedin }),
    ...(author.socialMedia.goodreads && { goodreads: author.socialMedia.goodreads }),
    ...(author.socialMedia.amazonAuthor && { amazonAuthor: author.socialMedia.amazonAuthor }),
  };
}

/**
 * Maps an Author entity to ReadAuthorDto
 * Used when converting Author entities to read DTOs for API responses
 */
export function mapAuthorToReadAuthorDto(author: Author): ReadAuthorDto {
  const socialMedia = buildSocialMedia(author);

  return {
    id: author.id,
    authorId: author.authorId,
    firstName: author.firstName,
    ...(author.middleName && { middleName: author.middleName }),
    lastName: author.lastName,
    displayName: author.displayName,
    ...(author.pseudonyms && { pseudonyms: author.pseudonyms }),
    ...(author.suffix && { suffix: author.suffix }),
    ...(author.shortBio && { shortBio: author.shortBio }),
    ...(author.longBio && { longBio: author.longBio }),
    genres: author.genres,
    ...(author.email && { email: author.email }),
    ...(author.website && { website: author.website }),
    ...(socialMedia && { socialMedia }),
    ...(author.profilePhotoUrl && { profilePhotoUrl: author.profilePhotoUrl }),
    ...(author.bannerImageUrl && { bannerImageUrl: author.bannerImageUrl }),
    ...(author.photoGallery && { photoGallery: author.photoGallery }),
    status: author.status,
    isVerified: author.isVerified,
  };
}

/**
 * Maps a CreateAuthorDto to Author entity
 * Used when creating a new author from the API request
 * Note: Statistics are NOT included in creation - they should be calculated separately
 */
export function mapCreateDtoToAuthor(newId: string, dto: CreateAuthorDto, context: ExecutionContext): Author {
  const timestamp = context.timestamp;
  const userId = context.userId ?? 'system';

  return {
    id: newId,
    authorId: newId,
    entityType: AUTHOR_ENTITY_TYPE,
    firstName: dto.firstName,
    ...(dto.middleName && { middleName: dto.middleName }),
    lastName: dto.lastName,
    displayName: dto.displayName,
    ...(dto.pseudonyms && { pseudonyms: dto.pseudonyms }),
    ...(dto.suffix && { suffix: dto.suffix }),
    ...(dto.shortBio && { shortBio: dto.shortBio }),
    ...(dto.longBio && { longBio: dto.longBio }),
    genres: dto.genres,
    ...(dto.email && { email: dto.email }),
    ...(dto.website && { website: dto.website }),
    ...(dto.socialMedia && { socialMedia: dto.socialMedia }),
    ...(dto.profilePhotoUrl && { profilePhotoUrl: dto.profilePhotoUrl }),
    ...(dto.bannerImageUrl && { bannerImageUrl: dto.bannerImageUrl }),
    ...(dto.photoGallery && { photoGallery: dto.photoGallery }),
    status: dto.status,
    isVerified: dto.isVerified,
    createdAt: timestamp,
    createdBy: userId,
    updatedAt: timestamp,
    updatedBy: userId,
    isDeleted: false,
    version: 1,
  };
}
