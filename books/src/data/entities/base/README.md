# Entity Base Types

## Purpose

This folder contains foundational types for entity composition using TypeScript's type system.

## NOT FOR EXTERNAL USE

**These types are INTERNAL to the entities folder only.**

They should NEVER be:

- Exported from the entities folder
- Imported by features, controllers, or any code outside `/data/entities/`
- Used in DTOs or API contracts

## Why?

These are **infrastructure composition primitives**. Exposing them would:

1. Couple domain logic to persistence concerns
2. Leak implementation details
3. Violate CQRS boundaries

## Usage Pattern

Entities compose from these base types:

```typescript
// ✅ CORRECT - Entity uses base types internally
import { BaseEntity, PartitionedEntity } from './base/entity-traits';

export interface Author extends BaseEntity, PartitionedEntity {
  authorId: string;
  // ...
}
```

```typescript
// ❌ WRONG - Feature importing base types
import { BaseEntity } from '@data/entities/base/entity-traits';
```

Features should only work with:

- DTOs (CreateAuthorDto, ReadAuthorDto, etc.)
- Commands/Queries
- Never raw entities or base types
