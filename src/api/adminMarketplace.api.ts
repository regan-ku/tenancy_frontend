import apiClient from "@/api/axios";
import { getMediaUrl } from "@/utils/media";

// ==========================================
// INTERFACES
// ==========================================
export interface MarketplaceListing {
  id: number;
  title: string;
  category: "rental" | "sale" | "short_stay";
  status: "active" | "hidden" | "pending_review" | "flagged" | "unpublished";
  is_featured: boolean;

  // Ownership
  owner_name: string;
  owner_type: "landlord" | "agency";
  owner_email: string;

  // Location & Pricing
  location: string;
  price: number;
  price_period?: string;

  // Analytics
  total_views: number;
  total_saves: number;
  total_inquiries: number;

  // Media
  cover_photo: string;
  media_count: number;

  created_at: string;
}

export interface ListingDeepDive extends MarketplaceListing {
  description: string;
  amenities: string[];
  media_files: { id: number; url: string; type: string }[];
}

// ==========================================
// API METHODS
// ==========================================
export const adminMarketplaceApi = {
  getAllListings: async (filters?: {
    status?: string;
    category?: string;
  }): Promise<MarketplaceListing[]> => {
    try {
      // In production, this hits an Admin-only endpoint that ignores public visibility rules
      const response = await apiClient.get("/api/admin/marketplace/listings/", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      // Mock Data: Shows a mix of public, hidden, and flagged listings
      return [
        {
          id: 101,
          title: "Modern 2BR in Kilimani",
          category: "rental",
          status: "active",
          is_featured: true,
          owner_name: "Nairobi Premier Realtors",
          owner_type: "agency",
          owner_email: "admin@nairokipremier.co.ke",
          location: "Kilimani, Nairobi",
          price: 85000,
          price_period: "month",
          total_views: 1450,
          total_saves: 84,
          total_inquiries: 12,
          cover_photo: "/media/properties/kilimani_1.jpg",
          media_count: 12,
          created_at: "2026-05-10",
        },
        {
          id: 102,
          title: "Luxury Villa Karen",
          category: "sale",
          status: "pending_review",
          is_featured: false,
          owner_name: "John Doe",
          owner_type: "landlord",
          owner_email: "john@email.com",
          location: "Karen, Nairobi",
          price: 45000000,
          total_views: 0,
          total_saves: 0,
          total_inquiries: 0,
          cover_photo: "/media/properties/karen_1.jpg",
          media_count: 24,
          created_at: "2026-06-18",
        },
        {
          id: 103,
          title: "Furnished Studio Westlands",
          category: "short_stay",
          status: "flagged",
          is_featured: false,
          owner_name: "Sarah Connor",
          owner_type: "landlord",
          owner_email: "sarah@email.com",
          location: "Westlands, Nairobi",
          price: 5000,
          price_period: "night",
          total_views: 320,
          total_saves: 15,
          total_inquiries: 4,
          cover_photo: "/media/properties/westlands_1.jpg",
          media_count: 8,
          created_at: "2026-06-01",
        },
        {
          id: 104,
          title: "Commercial Office Space",
          category: "rental",
          status: "hidden",
          is_featured: false,
          owner_name: "Westlands Properties Ltd",
          owner_type: "agency",
          owner_email: "info@westlands.co.ke",
          location: "Westlands, Nairobi",
          price: 120000,
          price_period: "month",
          total_views: 890,
          total_saves: 42,
          total_inquiries: 7,
          cover_photo: "/media/properties/office_1.jpg",
          media_count: 15,
          created_at: "2026-04-15",
        },
      ];
    }
  },

  getListingDeepDive: async (listingId: number): Promise<ListingDeepDive> => {
    // Mocking a deep dive fetch including all media files
    return {
      id: listingId,
      title: "Modern 2BR in Kilimani",
      category: "rental",
      status: "active",
      is_featured: true,
      owner_name: "Nairobi Premier Realtors",
      owner_type: "agency",
      owner_email: "admin@nairokipremier.co.ke",
      location: "Kilimani, Nairobi",
      price: 85000,
      price_period: "month",
      total_views: 1450,
      total_saves: 84,
      total_inquiries: 12,
      cover_photo: "/media/properties/kilimani_1.jpg",
      media_count: 12,
      created_at: "2026-05-10",
      description:
        "A beautifully finished 2-bedroom apartment with high-end finishes, ample parking, and 24/7 security.",
      amenities: ["Swimming Pool", "Gym", "Backup Generator", "Fiber Internet"],
      media_files: [
        { id: 1, url: "/media/properties/kilimani_1.jpg", type: "image" },
        { id: 2, url: "/media/properties/kilimani_2.jpg", type: "image" },
        { id: 3, url: "/media/properties/kilimani_3.jpg", type: "image" },
      ],
    };
  },

  moderateListing: async (
    listingId: number,
    action: "feature" | "unfeature" | "hide" | "publish" | "flag",
    reason?: string,
  ) => {
    return apiClient.post(
      `/api/admin/marketplace/listings/${listingId}/moderate/`,
      { action, reason },
    );
  },
};
