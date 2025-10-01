import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Location } from './base/location';
import { MediaContent } from './base/media-content';

export type EventType =
  | 'BookSigning'
  | 'Reading'
  | 'Talk'
  | 'Conference'
  | 'Workshop'
  | 'BookTour'
  | 'Festival';

export type EventStatus = 'Scheduled' | 'Completed' | 'Cancelled';

/**
 * AuthorEvent entity - represents public events featuring the author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorEvent extends BaseEntity, PartitionedEntity, MediaContent {
  // Partition Keys
  authorId: string;
  entityType: 'Event';

  // Event Details
  eventType: EventType;
  title: string;
  description?: string;

  // When & Where
  eventDate: Date;
  endDate?: Date;
  location: Location;

  // Registration
  isPublic: boolean;
  registrationUrl?: string;
  ticketPrice?: number;
  capacity?: number;

  // Status
  status: EventStatus;

  // Related
  relatedBookId?: string;
  eventImageUrl?: string;
}
