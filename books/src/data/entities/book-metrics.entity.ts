import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

/**
 * BookMetrics entity - aggregated analytics and engagement metrics
 *
 * Use cases:
 * - Analytics dashboards
 * - Trending/popular book queries
 * - Recommendation algorithms
 * - Sales reporting
 */
export interface BookMetrics extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_METRICS;
  totalSales: number;
  totalRevenue?: number;
  viewCount: number;
  downloadCount: number;
  wishlistCount: number;
  readCount: number;
  currentlyReadingCount: number;
  wantToReadCount: number;
  favoritesCount: number;
  calculatedAt: Date;
}
