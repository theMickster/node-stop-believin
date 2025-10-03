import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type NoteType = 'FunFact' | 'Trivia' | 'Research' | 'Anecdote' | 'WritingTip';

/**
 * AuthorNote entity - represents fun facts, trivia, and research notes about the author
 */
export interface AuthorNote extends BaseEntity, PartitionedEntity, Taggable {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR_NOTE;
  noteType: NoteType;
  title?: string;
  content: string;
  source?: string;
  sourceUrl?: string;
  verified: boolean;
  relatedBookId?: string;
  isPublic: boolean;
  isFeatured: boolean;
}
