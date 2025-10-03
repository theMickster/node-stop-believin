import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type InventoryStatus = 'Available' | 'CheckedOut' | 'OnHold' | 'InTransit' | 'Damaged' | 'Lost' | 'Repair';
export type InventoryLocation = 'MainFloor' | 'Storage' | 'Display' | 'BackRoom' | 'Warehouse' | 'ReturnCart';

/**
 * BookInventory entity - physical inventory tracking
 * Use cases:
 * - Library copy tracking
 * - Bookstore stock management
 * - Distribution center inventory
 */
export interface BookInventory extends BaseEntity, PartitionedEntity {
  bookId: string;
  entityType: typeof ENTITY_TYPES.BOOK_INVENTORY;
  copyNumber: number;
  barcode: string;
  rfidTag?: string;

  // Location
  locationId: string;
  locationName: string;
  locationType: 'Library' | 'Bookstore' | 'Warehouse';
  shelfLocation: string;
  section: string;
  inventoryLocation: InventoryLocation;

  // Status
  status: InventoryStatus;
  condition: 'New' | 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Damaged';
  conditionNotes?: string;

  // Circulation (Library-specific)
  totalCheckouts?: number;
  lastCheckoutDate?: Date;
  currentBorrowerId?: string;
  dueDate?: Date;
  renewalCount?: number;
  holdCount?: number;
}
