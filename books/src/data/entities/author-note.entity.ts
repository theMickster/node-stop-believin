import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';

export type NoteType = 'FunFact' | 'Trivia' | 'Research' | 'Anecdote' | 'WritingTip';

/**
 * AuthorNote entity - represents fun facts, trivia, and research notes about the author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorNote extends BaseEntity, PartitionedEntity, Taggable {
  // Partition Keys
  authorId: string;
  entityType: 'Note';

  // Note Content
  noteType: NoteType;
  title?: string;
  content: string;

  // Source
  source?: string;
  sourceUrl?: string;
  verified: boolean;

  // Classification
  relatedBookId?: string;

  // Visibility
  isPublic: boolean;
  isFeatured: boolean;
}
