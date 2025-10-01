import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { MediaContent } from './base/media-content';

export type BiographyEventType =
  | 'Birth'
  | 'Education'
  | 'Career'
  | 'Award'
  | 'Publication'
  | 'Personal'
  | 'Death';

/**
 * AuthorBiography entity - represents timeline events in an author's life
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorBiography
  extends BaseEntity,
    PartitionedEntity,
    MediaContent {
  // Partition Keys
  authorId: string;
  entityType: 'Biography';

  // Event Details
  eventDate: Date;
  eventType: BiographyEventType;
  title: string;
  description: string;
  location?: string;

  // References
  sourceUrl?: string;
  relatedBookId?: string;

  // Display
  displayOrder: number;
  isHighlight: boolean;
}
