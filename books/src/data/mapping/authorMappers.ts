import { Author } from '@data/entities/author.entity';
import { ReadAuthorDto, SocialMediaDto } from '@features/author/models/readAuthorDto';

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
