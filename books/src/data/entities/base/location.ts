/**
 * Location-related types for entity composition
 * NOT FOR EXPORT - Internal to entities folder only
 */

interface Location {
  venue?: string;
  address?: string;
  city: string;
  state?: string;
  country: string;
  coordinates?: GeoCoordinates;
}

interface GeoCoordinates {
  latitude: number;
  longitude: number;
}

export type { Location, GeoCoordinates };
