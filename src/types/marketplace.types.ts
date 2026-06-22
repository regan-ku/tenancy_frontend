// Based on your OpenAPI Schema for Marketplace

export type ListingType = "rental" | "sale" | "short_stay";
export type ListingStatus = "active" | "unavailable" | "hidden" | "archived";

export interface Listing {
  id: number;
  property: number;
  property_title: string;
  cover_photo: string | null;
  location_summary: string;
  min_rent_amount: string; // Decimal as string from backend
  price_period: string | null; // e.g., 'per month'
  listing_type: ListingType;
  status: ListingStatus;
}

export interface PropertyDetails {
  title: string;
  description: string;
  location: any; // Nested location object
  amenities: any; // Nested amenities object
}

export interface UnitGroupAvailability {
  total_units: number;
  available_units: number;
  occupied_units: number;
  is_marketplace_visible: boolean;
  availability_text: string;
}

export interface ListingDetail extends Listing {
  title: string;
  property_details: PropertyDetails;
  unit_group_availability: UnitGroupAvailability | null;
}

export interface SavedListing {
  id: number;
  listing: number;
  listing_details: Listing;
  notes: string | null;
  created_at: string;
}

export interface SearchFilters {
  q?: string;
  city?: string;
  min_price?: number;
  max_price?: number;
  category?: ListingType;
}
