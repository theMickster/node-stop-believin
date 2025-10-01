import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Rateable } from './base/behavioral-traits';

export type AuthorBookRole = 'Author' | 'CoAuthor' | 'Editor' | 'Translator' | 'Illustrator';

/**
 * AuthorBook entity - represents a book published by an author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 * This is a reference to the Book entity in the CosmicReadsBooks container
 */
export interface AuthorBook extends BaseEntity, PartitionedEntity, Rateable {
  // Partition Keys
  authorId: string;
  entityType: 'Book';

  // Book Reference
  bookId: string;
  bookTitle: string;
  isbn?: string;

  // Author's Role
  role: AuthorBookRole;
  contributionNotes?: string;

  // Publication
  publishedDate: Date;
  publisher?: string;

  // Author's Perspective
  authorNotes?: string;
  inspiration?: string;
  dedicatedTo?: string;

  // Statistics
  copiesSold?: number;
}
