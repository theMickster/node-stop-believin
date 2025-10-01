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

**Books Container** (`/bookId`, `/entityType`)
- `Book` - root book documents

**Authors Container** (`/authorId`, `/entityType`)
- `Author` - root author profile
- `AuthorBiography` - timeline events
- `AuthorBook` - published works
- `AuthorAward` - awards won
- `AuthorQuote` - memorable quotes
- `AuthorInterview` - interviews
- `AuthorEvent` - public events
- `AuthorReadingList` - book recommendations
- `AuthorSocialPost` - social media highlights
- `AuthorNote` - fun facts and trivia

## Base Types for Composition

Located in `base/` folder (INTERNAL USE ONLY - not exported):

**Entity Traits** (`base/entity-traits.ts`):
- `BaseEntity` - id, audit fields (createdAt, updatedAt, etc.)
- `PartitionedEntity` - entityType for hierarchical partitioning
- `SoftDeletable` - isDeleted, deletedAt
- `Versionable` - version for optimistic concurrency

**Location Types** (`base/location.ts`):
- `Location` - geographic location with coordinates
- `GeoCoordinates` - latitude/longitude

**Social & Media** (`base/social-media.ts`, `base/media-content.ts`):
- `SocialMediaLinks` - social media profiles
- `MediaContent` - media URLs

**Behavioral Traits** (`base/behavioral-traits.ts`):
- `Taggable` - tags array
- `Rateable` - rating fields
- `Engageable` - likes, shares, comments

**Note:** These types are NOT exported outside the entities folder to maintain proper encapsulation.

## Entity Files

### Books Domain
- `book.entity.ts` - Book entity
- `book-author.type.ts` - Embedded BookAuthor type (denormalized in Book)

### Authors Domain
- `author.entity.ts` - Author root entity
- `author-biography.entity.ts` - Author timeline events
- `author-book.entity.ts` - Author's published works
- `author-award.entity.ts` - Awards won
- `author-quote.entity.ts` - Memorable quotes
- `author-interview.entity.ts` - Interviews
- `author-event.entity.ts` - Public events
- `author-reading-list.entity.ts` - Book recommendations
- `author-social-post.entity.ts` - Social media posts
- `author-note.entity.ts` - Fun facts and notes

### Legacy
- `author.ts` - Legacy Author interface (deprecated, kept for backward compatibility)

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

## Query Patterns

### Get all quotes by an author:
```sql
SELECT * FROM c
WHERE c.authorId = @authorId
  AND c.entityType = 'Quote'
```

### Get author timeline:
```sql
SELECT * FROM c
WHERE c.authorId = @authorId
  AND c.entityType = 'Biography'
ORDER BY c.eventDate
```

### Get upcoming events:
```sql
SELECT * FROM c
WHERE c.authorId = @authorId
  AND c.entityType = 'Event'
  AND c.status = 'Scheduled'
  AND c.eventDate >= @today
ORDER BY c.eventDate
```

## Next Steps for Implementation

1. Create repositories for each entity type
2. Implement CQRS commands/queries in features folders
3. Add validation using your validator pattern
4. Create DTOs for API inputs/outputs
5. Wire up IoC container bindings
