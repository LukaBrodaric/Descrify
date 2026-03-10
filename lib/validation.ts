import { z } from "zod";
import { AMENITIES, PROPERTY_TYPES, LISTING_TYPES, INTERIOR_STYLES, PropertyType, ListingType, InteriorStyle, Amenity } from "@/types";

export const propertyFormSchema = z.object({
  propertyType: z.enum(PROPERTY_TYPES, {
    required_error: "Please select a property type",
  }),
  listingType: z.enum(LISTING_TYPES, {
    required_error: "Please select a listing type",
  }),
  location: z.string().min(2, "Location must be at least 2 characters"),
  propertySize: z.coerce.number().min(1, "Property size must be at least 1 m²"),
  bedrooms: z.coerce.number().min(0, "Bedrooms cannot be negative"),
  bathrooms: z.coerce.number().min(0, "Bathrooms cannot be negative"),
  maxGuests: z.coerce.number().min(1).max(50).optional(),
  distanceToSea: z.string().optional(),
  distanceToCityCenter: z.string().optional(),
  nearbyAttractions: z.string().optional(),
  amenities: z.array(z.enum(AMENITIES)).default([]),
  locationHighlights: z.string().optional(),
  yearBuilt: z.string().optional(),
  interiorStyle: z.enum(INTERIOR_STYLES).optional(),
  specialHighlights: z.string().optional(),
  additionalDetails: z.string().optional(),
}).refine((data) => {
  if (data.listingType === "Vacation rental" && data.maxGuests === undefined) {
    return false;
  }
  return true;
}, {
  message: "Maximum guests is required for vacation rentals",
  path: ["maxGuests"],
});

export type PropertyFormSchema = z.infer<typeof propertyFormSchema>;
