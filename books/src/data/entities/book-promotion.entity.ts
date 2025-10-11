import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type PromotionType = 'Discount' | 'Featured' | 'NewRelease' | 'BestSeller';
export type PromotionStatus = 'Scheduled' | 'Active' | 'Expired';

/**
 * BookPromotion entity - simple marketing promotions
 *
 * Simplified for learning purposes - demonstrates:
 * - Basic discount logic
 * - Time-based promotions
 * - Featured book highlighting
 * - UI display priority
 *
 * Perfect for building Angular storefront features with RxJS and NgRx
 */
export interface BookPromotion extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_PROMOTION;

  name: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;

  startDate: Date;
  endDate: Date;

  // Simple discount - either percentage OR fixed amount
  discountPercentage?: number; // e.g., 15 = 15% off
  discountAmount?: number; // e.g., 5.00 = $5 off

  // Display settings for UI
  isFeatured: boolean;
  displayPriority?: number; // Higher number = shown first
}
