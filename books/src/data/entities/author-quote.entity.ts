import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type QuoteCategory = 'Writing' | 'Life' | 'Humor' | 'Inspiration' | 'Political' | 'Literary';

/**
 * AuthorQuote entity - represents memorable quotes from an author
 */
export interface AuthorQuote extends BaseEntity, PartitionedEntity, Taggable {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR_QUOTE;
  quote: string;
  context?: string;
  source?: string;
  sourceUrl?: string;
  category?: QuoteCategory;
  isFavorite: boolean;
  likesCount?: number;
}
