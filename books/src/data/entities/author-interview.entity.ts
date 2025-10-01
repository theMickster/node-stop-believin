import { BaseEntity, PartitionedEntity } from './base/entity-traits';
import { MediaContent } from './base/media-content';
import { Taggable } from './base/behavioral-traits';

export type InterviewFormat = 'Text' | 'Video' | 'Audio' | 'Podcast';

/**
 * AuthorInterview entity - represents interviews with the author
 * Stored in CosmicReadsAuthorContainer with partition key: /authorId, /entityType
 */
export interface AuthorInterview
  extends BaseEntity,
    PartitionedEntity,
    MediaContent,
    Taggable {
  // Partition Keys
  authorId: string;
  entityType: 'Interview';

  // Interview Metadata
  title: string;
  interviewer?: string;
  interviewDate: Date;
  publication?: string;
  format: InterviewFormat;

  // Content
  summary?: string;
  fullTranscript?: string;
  keyQuotes?: string[];

  // Media
  videoUrl?: string;
  audioUrl?: string;

  // Topics
  topics?: string[];
  duration?: number;
}
