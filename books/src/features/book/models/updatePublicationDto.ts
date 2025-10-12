import { ISBN } from '@data/entities/book.entity';

/**
 * DTO for correcting publication information after a book has been published
 * Requires a reason for audit trail purposes
 *
 * Note: Library classification fields should be updated via the dedicated
 * classification endpoints, not through publication updates
 */
export interface UpdatePublicationDto {
  isbn?: ISBN;
  publishedDate?: Date;
  copyright?: string;
  edition?: string;

  // Required: explanation for why publication data is being corrected
  reason: string;
}
