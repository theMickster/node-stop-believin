import { AuthorStatus } from '@data/entities/metadata/authorStatus.type';

export interface CreateAuthorDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  pseudonyms?: string[];
  suffix?: string;
  shortBio?: string;
  longBio?: string;
  genres: string[];
  email?: string;
  website?: string;
  socialMedia?: CreateAuthorSocialMediaDto;
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  photoGallery?: string[];
  status: AuthorStatus;
  isVerified: boolean;
}

export interface CreateAuthorSocialMediaDto {
  twitter?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  goodreads?: string;
  amazonAuthor?: string;
}
