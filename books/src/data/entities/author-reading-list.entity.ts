import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Rateable } from './base/behavioral-traits';

/**
 * AuthorReadingList entity - represents books recommended by the author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorReadingList extends BaseEntity, PartitionedEntity, Rateable {
  // Partition Keys
  authorId: string;
  entityType: 'ReadingList';

  // Book Recommendation
  recommendedBookTitle: string;
  recommendedBookAuthor: string;
  recommendedBookId?: string;
  isbn?: string;

  // Recommendation
  recommendation: string;

  // Context
  listName?: string;
  category?: string;
}
