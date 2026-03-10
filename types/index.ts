export type PropertyType = "Apartment" | "House" | "Villa" | "Studio" | "Land";
export type ListingType = "For sale" | "Vacation rental";
export type InteriorStyle = "modern" | "luxury" | "rustic" | "minimalist";

export const PROPERTY_TYPES = ["Apartment", "House", "Villa", "Studio", "Land"] as const;
export const LISTING_TYPES = ["For sale", "Vacation rental"] as const;
export const INTERIOR_STYLES = ["modern", "luxury", "rustic", "minimalist"] as const;

export const AMENITIES = [
  "Pool",
  "Balcony",
  "Terrace",
  "Garden",
  "Parking",
  "Sea view",
  "Air conditioning",
  "Modern kitchen",
  "BBQ area",
  "Private entrance",
  "Pet friendly",
  "Fast WiFi",
] as const;

export type Amenity = (typeof AMENITIES)[number];

export interface PropertyFormData {
  propertyType: PropertyType;
  listingType: ListingType;
  location: string;
  propertySize: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests?: number;
  distanceToSea?: string;
  distanceToCityCenter?: string;
  nearbyAttractions?: string;
  amenities: Amenity[];
  locationHighlights?: string;
  yearBuilt?: string;
  interiorStyle?: InteriorStyle;
  specialHighlights?: string;
  additionalDetails?: string;
}

export interface GeneratedOutput {
  seoTitle: string;
  shortDescription: string;
  longDescription: string;
  listingVersion: string;
  detectedImageFeatures: string[];
  suggestedKeywords: string[];
}

export interface GenerationResponse {
  success: boolean;
  data?: GeneratedOutput;
  error?: string;
  remainingGenerations?: number;
  usedGenerations?: number;
}

export interface RateLimitInfo {
  count: number;
  resetAt: number;
}
