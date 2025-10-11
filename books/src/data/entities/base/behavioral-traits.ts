/**
 * Behavioral traits for entity composition
 * NOT FOR EXPORT - Internal to entities folder only
 */

interface Taggable {
  tags?: string[];
}

interface Rateable {
  rating?: number;
  averageRating?: number;
}

interface Engageable {
  likes?: number;
  shares?: number;
  comments?: number;
}

export type { Taggable, Rateable, Engageable };
