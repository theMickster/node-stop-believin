import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type PromotionType =
  | 'Discount'
  | 'BuyOneGetOne'
  | 'FreeShipping'
  | 'BundleDeal'
  | 'StaffPick'
  | 'NewRelease'
  | 'BestSeller'
  | 'SeasonalSale'
  | 'LimitedEdition';

export type PromotionStatus = 'Scheduled' | 'Active' | 'Paused' | 'Expired' | 'Cancelled';
export type DiscountType = 'Percentage' | 'FixedAmount' | 'BuyXGetY' | 'FreeItem';

/**
 * BookPromotion entity - marketing campaigns and special offers
 * Use cases:
 * - Bookstore sales and discounts
 * - Marketing campaign tracking
 * - Staff picks and featured books
 * - New release highlighting
 * - Seasonal sales (back to school, holiday gift guides)
 */
export interface BookPromotion extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_PROMOTION;
  promotionCode?: string;
  name: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;

  startDate: Date;
  endDate: Date;
  isRecurring: boolean;
  recurrencePattern?: string; // "Weekly", "Monthly", etc.

  // Discount Details
  discountType?: DiscountType;
  discountPercentage?: number;
  discountAmount?: number;
  currency?: string;
  minPurchaseAmount?: number;
  maxDiscountAmount?: number;

  // Bundle Details
  bundledBookIds?: string[];
  bundlePrice?: number;
  bundleDescription?: string;

  // Buy X Get Y
  buyQuantity?: number;
  getQuantity?: number;
  getFreeItem?: boolean;
  getDiscountPercent?: number;

  // Display Settings
  isFeatured: boolean;
  displayPriority?: number;

  termsAndConditions?: string;
}
