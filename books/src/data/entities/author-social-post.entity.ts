import { Engageable, Taggable } from './base/behavioral-traits';
import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { ENTITY_TYPES } from './base/entity-types';

export type SocialPlatform = 'Twitter' | 'Instagram' | 'Facebook' | 'Blog' | 'LinkedIn';

/**
 * AuthorSocialPost entity - represents notable social media posts from the author
 */
export interface AuthorSocialPost extends BaseEntity, PartitionedEntity, Engageable, Taggable {
  authorId: string;
  entityType: typeof ENTITY_TYPES.AUTHOR_SOCIAL_POST;
  platform: SocialPlatform;
  content: string;
  postUrl: string;
  postedDate: Date;
  images?: string[];
  videoUrl?: string;
  isHighlight: boolean;
}
