import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';
import { MediaContent } from './base/media-content';

export type AwardSignificance = 'Major' | 'Moderate' | 'Minor';

/**
 * AuthorAward entity - represents awards won by an author
 */
export interface AuthorAward extends BaseEntity, PartitionedEntity, MediaContent {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR_AWARD;
  awardName: string;
  category?: string;
  year: number;
  awardedFor?: string;
  bookId?: string;
  description?: string;
  significance: AwardSignificance;
  pressReleaseUrl?: string;
}
