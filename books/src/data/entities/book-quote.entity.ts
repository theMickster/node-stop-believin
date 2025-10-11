import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type QuoteContext = 'Dialogue' | 'Narration' | 'Description' | 'Opening' | 'Closing' | 'Climax' | 'Other';

/**
 * BookQuote entity - memorable passages and excerpts
 *
 * Use cases:
 * - Blogger citation and reference
 * - Marketing materials and promotional content
 * - Reading group discussion starters
 * - Social media sharing
 * - Preview/sample content for potential readers
 */
export interface BookQuote extends BaseEntity, PartitionedEntity, Taggable {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_QUOTE;
  text: string;
  context?: QuoteContext;
  chapter?: string;
  pageNumber?: number;
  location?: string;
  speaker?: string;
  submittedBy?: string;

  isPopular: boolean;
  shareCount: number;
  likeCount: number;

  // Moderation
  isApproved: boolean;
  approvedBy?: string;
  approvedAt?: Date;
  flagCount?: number;
  flagReasons?: string[];
}
