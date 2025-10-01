/**
 * Core entity traits for composition
 * NOT FOR EXPORT - Internal to entities folder only
 */

interface BaseEntity {
  id: string;
  createdAt: Date;
  createdBy: string;
  updatedAt: Date;
  updatedBy: string;
}

interface PartitionedEntity {
  entityType: string;
}

interface SoftDeletable {
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: string;
}

interface Versionable {
  version: number;
}

export type { BaseEntity, PartitionedEntity, SoftDeletable, Versionable };
