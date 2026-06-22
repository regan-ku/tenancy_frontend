import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface SavedProperty {
  id: string;
  listing_id: number;
  title: string;
  property_type: string;
  location: string;
  price: number;
  price_period: string;
  cover_image: string;
  saved_at: string;
}

export interface ViewingRequest {
  id: string;
  property_title: string;
  property_location: string;
  preferred_date: string;
  preferred_time: string;
  contact_channel: "whatsapp" | "phone_call" | "email";
  status: "pending" | "confirmed" | "completed" | "cancelled";
  agent_name: string | null;
  agent_phone: string | null;
  created_at: string;
}

export interface MarketplaceApplication {
  id: string;
  property_title: string;
  unit_code: string;
  location: string;
  status: "submitted" | "under_review" | "approved" | "rejected";
  submitted_at: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantMarketplaceApi = {
  // 1. Saved Properties (Wishlist)
  getSavedProperties: async (): Promise<SavedProperty[]> => {
    try {
      const response = await apiClient.get("/api/marketplace/saved/");
      return response.data;
    } catch (error) {
      return [
        {
          id: "S1",
          listing_id: 101,
          title: "Modern 2BR in Kilimani",
          property_type: "Apartment",
          location: "Kilimani, Nairobi",
          price: 85000,
          price_period: "month",
          cover_image: "/media/props/kilimani.jpg",
          saved_at: "2026-06-15",
        },
        {
          id: "S2",
          listing_id: 105,
          title: "Sunny Studio Westlands",
          property_type: "Studio",
          location: "Westlands, Nairobi",
          price: 35000,
          price_period: "month",
          cover_image: "/media/props/westlands.jpg",
          saved_at: "2026-06-18",
        },
      ];
    }
  },

  removeSavedProperty: async (listingId: number) => {
    return apiClient.delete(`/api/marketplace/saved/${listingId}/`);
  },

  // 2. Viewing Requests
  getMyViewings: async (): Promise<ViewingRequest[]> => {
    return [
      {
        id: "V1",
        property_title: "Modern 2BR in Kilimani",
        property_location: "Kilimani, Nairobi",
        preferred_date: "2026-06-22",
        preferred_time: "10:00 AM",
        contact_channel: "whatsapp",
        status: "confirmed",
        agent_name: "Alice Agent",
        agent_phone: "+254711222333",
        created_at: "2026-06-19",
      },
      {
        id: "V2",
        property_title: "Commercial Shop Westlands",
        property_location: "Westlands, Nairobi",
        preferred_date: "2026-06-25",
        preferred_time: "02:00 PM",
        contact_channel: "phone_call",
        status: "pending",
        agent_name: null,
        agent_phone: null,
        created_at: "2026-06-20",
      },
    ];
  },

  requestViewing: async (listingId: number, data: any) => {
    return apiClient.post(
      `/api/marketplace/listings/${listingId}/request-viewing/`,
      data,
    );
  },

  // 3. Marketplace Applications (Pre-tenancy)
  getMarketplaceApplications: async (): Promise<MarketplaceApplication[]> => {
    return [
      {
        id: "MA1",
        property_title: "Luxury Villa Karen",
        unit_code: "Villa A",
        location: "Karen, Nairobi",
        status: "under_review",
        submitted_at: "2026-06-10",
      },
    ];
  },
};
