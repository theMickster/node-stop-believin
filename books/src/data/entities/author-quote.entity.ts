import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';

export type QuoteCategory = 'Writing' | 'Life' | 'Humor' | 'Inspiration' | 'Political' | 'Literary';

/**
 * AuthorQuote entity - represents memorable quotes from an author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorQuote extends BaseEntity, PartitionedEntity, Taggable {
  // Partition Keys
  authorId: string;
  entityType: 'Quote';

  // Quote Content
  quote: string;
  context?: string;
  source?: string;
  sourceUrl?: string;

  // Classification
  category?: QuoteCategory;

  // Engagement
  isFavorite: boolean;
  likesCount?: number;
}
