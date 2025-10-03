import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Taggable } from './base/behavioral-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type ReviewStatus = 'Published' | 'Pending' | 'Rejected' | 'Flagged' | 'Archived';
export type ReviewSource = 'Customer' | 'Professional' | 'Editorial' | 'Blog' | 'Media';

/**
 * BookReview entity - customer and professional reviews
 */
export interface BookReview extends BaseEntity, PartitionedEntity, Taggable {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_REVIEW;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerLocation?: string;
  isVerifiedPurchase: boolean;

  // Review Content
  title?: string;
  content: string;
  rating: number;
  reviewDate: Date;

  // Review Source
  source: ReviewSource;
  sourceUrl?: string;

  // Engagement
  helpfulCount: number;
  notHelpfulCount: number;
  reportedCount: number;
  likeCount: number;
  commentCount: number;

  // Moderation
  status: ReviewStatus;
  moderatedBy?: string;
  moderatedAt?: Date;
  moderationNotes?: string;

  // Review Details
  readingDuration?: number;
  readingFormat?: string;
  wouldRecommend: boolean;
  spoilerWarning: boolean;

  // Response
  authorResponse?: {
    content: string;
    respondedAt: Date;
    respondedBy: string;
  };
  publisherResponse?: {
    content: string;
    respondedAt: Date;
  };
}
