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
  service_charge: string;
  billing_cycle: string;
  capacity: number;
  available_units: number; // ✅ ADDED: Fixes the TypeScript error on the listing page
  cover_photo?: string | null;
  is_active: boolean;
  allows_pets_override?: boolean | null;
}

export interface PublicMedia {
  id: number;
  file: string;
  media_type: string;
  caption?: string | null;
  display_order?: number;
  unit_group: number | null;
}

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

  getFeaturedListings: async (): Promise<{ results: Listing[] }> => {
    const response = await apiClient.get(endpoints.MARKETPLACE.FEATURED);
    return response.data;
  },

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
