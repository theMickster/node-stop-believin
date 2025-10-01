import {
  BaseEntity,
  PartitionedEntity,
  SoftDeletable,
  Versionable,
} from './base/entity-traits';
import { SocialMediaLinks } from './base/social-media';
import { Location } from './base/location';

export type AuthorStatus = 'Active' | 'Retired' | 'Deceased' | 'Inactive';

export interface Education {
  institution: string;
  degree?: string;
  field?: string;
  year?: number;
}

export interface AuthorStatistics {
  totalBooks: number;
  totalSeries: number;
  averageRating?: number;
  totalReviews?: number;
  totalAwards?: number;
  firstPublished?: Date;
  lastPublished?: Date;
}

export interface BirthPlace extends Pick<Location, 'city' | 'state' | 'country'> {}

/**
 * Author root entity - represents the core author profile
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface Author
  extends BaseEntity,
    PartitionedEntity,
    SoftDeletable,
    Versionable {
  // Partition Keys
  authorId: string;
  entityType: 'Author';

  // Basic Identity
  firstName: string;
  middleName?: string;
  lastName: string;
  displayName: string;
  pseudonyms?: string[];
  suffix?: string;

  // Biography
  shortBio?: string;
  longBio?: string;

  // Personal Details
  birthDate?: Date;
  deathDate?: Date;
  birthPlace?: BirthPlace;
  nationality?: string[];
  languages?: string[];

  // Professional
  occupation?: string[];
  education?: Education[];
  genres: string[];

  // Contact & Web Presence
  email?: string;
  website?: string;
  socialMedia?: SocialMediaLinks;

  // Statistics
  statistics?: AuthorStatistics;

  // Media
  profilePhotoUrl?: string;
  bannerImageUrl?: string;
  photoGallery?: string[];

  // Fun Facts
  favoriteBook?: string;
  writingHabits?: string;
  funFacts?: string[];

  // Status
  status: AuthorStatus;
  isVerified: boolean;
}
