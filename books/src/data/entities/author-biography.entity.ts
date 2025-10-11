import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { MediaContent } from './base/media-content';
import { ENTITY_TYPES } from './base/entity-types';

export type BiographyEventType = 'Birth' | 'Education' | 'Career' | 'Award' | 'Publication' | 'Personal' | 'Death';

/**
 * AuthorBiography entity - represents timeline events in an author's life
 */
export interface AuthorBiography extends BaseEntity, PartitionedEntity, MediaContent {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR_BIOGRAPHY;
  eventDate: Date;
  eventType: BiographyEventType;
  title: string;
  description: string;
  location?: string;
  sourceUrl?: string;
  relatedBookId?: string;
  displayOrder: number;
  isHighlight: boolean;
}
