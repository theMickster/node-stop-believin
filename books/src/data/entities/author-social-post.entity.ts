import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { Engageable, Taggable } from './base/behavioral-traits';

export type SocialPlatform = 'Twitter' | 'Instagram' | 'Facebook' | 'Blog' | 'LinkedIn';

/**
 * AuthorSocialPost entity - represents notable social media posts from the author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorSocialPost
  extends BaseEntity,
    PartitionedEntity,
    Engageable,
    Taggable {
  // Partition Keys
  authorId: string;
  entityType: 'SocialPost';

  // Post Content
  platform: SocialPlatform;
  content: string;
  postUrl: string;
  postedDate: Date;

  // Media
  images?: string[];
  videoUrl?: string;

  // Classification
  isHighlight: boolean;
}
