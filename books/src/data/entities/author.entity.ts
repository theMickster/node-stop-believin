import { AuthorStatistics } from './authorStatistics.entity';
import { BaseEntity, PartitionedEntity, SoftDeletable, Versionable } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';
import { SocialMediaLinks } from './base/social-media';
import { AuthorStatus } from './metadata/authorStatus.type';

/**
 * Author root entity - represents the core author profile
 */
export interface Author extends BaseEntity, PartitionedEntity, SoftDeletable, Versionable {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR;

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
  socialMedia?: SocialMediaLinks;
  statistics?: AuthorStatistics;
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  photoGallery?: string[];
  status: AuthorStatus;
  isVerified: boolean;
}
