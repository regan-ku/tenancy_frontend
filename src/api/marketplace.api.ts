import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================

// ✅ NEW: Interface for the public unit groups returned by the detail API
export interface PublicUnitGroup {
  id: number;
  name: string;
  description?: string | null;
  unit_type: string;
  floor_range: string;
  base_rent_amount: string;
  deposit_amount: string;
  service_charge_amount: string;
  billing_cycle: string;
  capacity: number;
  cover_photo?: string | null;
  is_active: boolean;
  allows_pets_override?: boolean | null;
}

// ... (keep your other interfaces exactly the same) ...

export interface PublicMedia {
  id: number;
  file: string;
  media_type: string;
  caption?: string | null;
  display_order?: number; // ✅ ADDED THIS LINE
  unit_group: number | null; 
}

// ... (keep the rest of the file the same) ...

export interface Listing {
  id: number;
  property: number;
  property_title: string;
  cover_photo: string | null;
  location_summary: string;
  min_rent_amount: string;
  price_period: string | null;
  listing_type: "rental" | "sale" | "short_stay";
  status: "active" | "unavailable" | "hidden" | "archived";
}

export interface ListingDetail extends Listing {
  title: string;
  property_details: {
    title: string;
    description: string;
    property_category?: string;
    property_sub_type?: string;
    number_of_floors?: number;
    location: any;
    amenities: any;
  };
  unit_group_availability: any;

  // ✅ ADDED: The new fields from the Public API Bridge
  available_unit_groups: PublicUnitGroup[];
  property_media: PublicMedia[];
}

export interface SavedListing {
  id: number;
  listing: number;
  listing_details: Listing;
  notes: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ==========================================
// API METHODS
// ==========================================
export const marketplaceApi = {
  getListings: async (
    params?: Record<string, any>,
  ): Promise<PaginatedResponse<Listing>> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.LISTINGS, {
      params,
    });
    return response.data;
  },

  getListingDetail: async (id: number): Promise<ListingDetail> => {
    const response = await apiClient.get(
      endpoints.MARKETPLACE.LISTING_DETAIL(id),
    );
    return response.data;
  },

  searchListings: async (
    filters: Record<string, any>,
  ): Promise<PaginatedResponse<Listing>> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.SEARCH, {
      params: filters,
    });
    return response.data;
  },

  // ✅ Fetch Featured Listings for the Hero Section
  getFeaturedListings: async (): Promise<{ results: Listing[] }> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.FEATURED);
    return response.data;
  },

  // ✅ Fetch Nearby Listings based on GPS
  getNearbyListings: async (
    lat: number,
    lng: number,
    radius = 5,
  ): Promise<{ count: number; results: ListingDetail[] }> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.NEARBY, {
      params: { lat, lng, radius },
    });
    return response.data;
  },

  // Saved Listings (Watchlist) Methods
  getSavedListings: async (): Promise<PaginatedResponse<SavedListing>> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.SAVED);
    return response.data;
  },

  saveListing: async (
    listingId: number,
    notes?: string,
  ): Promise<SavedListing> => {
    const response = await apiClient.post(endpoints.MARKETPLACE.SAVED, {
      listing: listingId,
      notes: notes || "",
    });
    return response.data;
  },

  unsaveListing: async (savedId: number): Promise<void> => {
    await apiClient.delete(endpoints.MARKETPLACE.SAVED_DETAIL(savedId));
  },
};
