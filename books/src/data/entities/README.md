# Entity Architecture

## Overview

This directory contains entity definitions using **composition over inheritance** principles. All entities are designed for Azure Cosmos DB with hierarchical partitioning.

## Design Principles

### 1. Composition Over Inheritance

- Shared behaviors defined as composable interfaces in `common.types.ts`
- Entities composed from multiple small interfaces using TypeScript's intersection types
- Avoids tight coupling and fragile base class problems

### 2. Partition Strategy

Each entity includes partition key fields for optimal Cosmos DB performance:

- **Books Container** (`/bookId`, `/entityType`)
- **Authors Container** (`/authorId`, `/entityType`)

## Base Types for Composition

Located in `base/` folder (INTERNAL USE ONLY - not exported):

**Entity Traits** (`base/entity-traits.ts`):

- `BaseEntity` - id, audit fields (createdAt, updatedAt, etc.)
- `PartitionedEntity` - entityType for hierarchical partitioning
- `SoftDeletable` - isDeleted, deletedAt
- `Versionable` - version for optimistic concurrency

**Social & Media** (`base/social-media.ts`, `base/media-content.ts`):

- `SocialMediaLinks` - social media profiles
- `MediaContent` - media URLs

**Behavioral Traits** (`base/behavioral-traits.ts`):

- `Taggable` - tags array
- `Rateable` - rating fields
- `Engageable` - likes, shares, comments

**Note:** These types are NOT exported outside the entities folder to maintain proper encapsulation.

## Usage

**IMPORTANT:** Entities should ONLY be imported by repositories. Features should never import entities directly.

### In Repositories (CORRECT):

```typescript
import { Author } from '@data/entities/author.entity';
import { AuthorQuote } from '@data/entities/author-quote.entity';

class AuthorRepository {
  // Use entities here
}
```

### In Features (INCORRECT - DO NOT DO THIS):

```typescript
// ❌ WRONG - Features should use DTOs, not entities
import { Author } from '@data/entities/author.entity';
```
