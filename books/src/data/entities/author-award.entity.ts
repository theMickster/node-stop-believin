import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { MediaContent } from './base/media-content';

export type AwardSignificance = 'Major' | 'Moderate' | 'Minor';

/**
 * AuthorAward entity - represents awards won by an author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorAward extends BaseEntity, PartitionedEntity, MediaContent {
  // Partition Keys
  authorId: string;
  entityType: 'Award';

  // Award Details
  awardName: string;
  category?: string;
  year: number;
  awardedFor?: string;
  bookId?: string;

  // Details
  description?: string;
  significance: AwardSignificance;

  // Media
  pressReleaseUrl?: string;
}
