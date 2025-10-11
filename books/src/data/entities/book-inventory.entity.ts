import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type InventoryStatus = 'InStock' | 'LowStock' | 'OutOfStock' | 'PreOrder';

/**
 * BookInventory entity - simple stock tracking for e-commerce
 *
 * Simplified for learning purposes - demonstrates:
 * - Basic stock availability
 * - Reserved quantity (items in carts)
 * - Restock tracking
 *
 * Perfect for building Angular shopping cart features with real-time stock updates
 */
export interface BookInventory extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_INVENTORY;
  editionId: string; // Link to specific BookEdition (format/version)

  quantityAvailable: number;
  quantityReserved: number; // Items in shopping carts but not yet purchased

  status: InventoryStatus;

  restockDate?: Date;
  lastRestocked?: Date;
}
