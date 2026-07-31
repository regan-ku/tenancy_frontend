import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// RAW BACKEND RESPONSE TYPES (To avoid 'any')
// ==========================================
interface RawDelegationInfo {
  agency_name?: string | null;
  delegation_type?: "full" | "partial" | "view_only" | null;
  status?: "active" | "pending" | "revoked" | null;
}

interface RawLocationDetails {
  estate?: string;
  street?: string;
  city?: string;
  county?: string;
  region?: string;
  postal_code?: string;
  landmark?: string;
  latitude?: number | string | null;
  longitude?: number | string | null;
}

interface RawPropertyResponse {
  id: number;
  delegation_id?: number | null;
  title: string;
  location_details?: RawLocationDetails | null;
  total_units?: number;
  total_units_capacity?: number;
  occupied_units?: number;
  available_units?: number;
  occupancy_rate?: number;
  ownership_status?: "self_managed" | "delegated";
  delegation_info?: RawDelegationInfo | null;
  is_active?: boolean;
  is_published?: boolean;
  description?: string;
  property_category?: string;
  property_sub_type?: string;
  construction_type?: string;
  number_of_floors?: number;
  is_single_unit_property?: boolean;
  has_water?: boolean;
  has_electricity?: boolean;
  has_internet?: boolean;
  has_cctv?: boolean;
  has_elevator?: boolean;
  has_generator?: boolean;
  has_gym?: boolean;
  has_swimming_pool?: boolean;
  allows_pets?: boolean;
  parking_spaces?: number;
  listing_type?: string;
  cover_photo?: string;
}

interface RawMediaResponse {
  id: number;
  media_type: string;
  file?: string | null;
  url?: string | null;
  caption?: string | null;
  display_order?: number | null;
  created_at?: string | null;
  unit?: number | null;
  unit_group?: number | null;
}

export interface DelegationResponse {
  id: number;
  property_id: number;
  agency_id: number;
  delegation_type: "full" | "partial" | "view_only";
  status: "active" | "pending" | "revoked";
  created_at: string;
}

// ==========================================
// FRONTEND INTERFACES
// ==========================================
export interface LandlordProperty {
  id: number;
  delegation_id?: number | null;
  name: string;
  location: string;
  total_units: number;
  occupied_units: number;
  available_units: number;
  occupancy_rate: number;
  ownership_type: "self_managed" | "delegated";
  is_delegated: boolean;
  agency_name: string | null;
  delegation_type: "full" | "partial" | "view_only" | null;
  delegation_status: "active" | "pending" | "revoked" | null;
  status: "active" | "inactive";
  is_published: boolean;
}

export interface LandlordPropertyDetail extends LandlordProperty {
  description: string;
  property_category: string;
  property_sub_type: string;
  construction_type: string;
  number_of_floors: number;
  total_units_capacity: number;
  is_single_unit_property: boolean;
  has_water: boolean;
  has_electricity: boolean;
  has_internet: boolean;
  has_cctv: boolean;
  has_elevator: boolean;
  has_generator: boolean;
  has_gym: boolean;
  has_swimming_pool: boolean;
  allows_pets: boolean;
  parking_spaces: number;
  location_details: {
    estate: string;
    street: string;
    city: string;
    county: string;
    region: string;
    postal_code: string;
    landmark: string;
    latitude?: number | string;
    longitude?: number | string;
  };
  listing_type: string;
  is_active: boolean;
  cover_photo: string;
}

export interface PropertyMedia {
  id: number;
  media_type: string;
  file: string;
  url: string;
  caption: string;
  display_order: number;
  created_at: string;
}

export interface PropertyTeamMember {
  id: number;
  user: number;
  user_email: string;
  user_name: string;
  user_phone: string;
  operational_role: "caretaker" | "agent" | "property_manager";
  assigned_by_entity_type: "landlord" | "agency";
  assigned_by_agency_name: string | null;
  is_active: boolean;
  assigned_at: string;
}

export interface UpdatePropertyPayload {
  title?: string;
  description?: string;
  property_category?: string;
  property_sub_type?: string;
  construction_type?: string;
  number_of_floors?: number;
  total_units_capacity?: number;
  is_single_unit_property?: boolean;
  has_water?: boolean;
  has_electricity?: boolean;
  has_internet?: boolean;
  has_cctv?: boolean;
  has_elevator?: boolean;
  has_generator?: boolean;
  has_gym?: boolean;
  has_swimming_pool?: boolean;
  allows_pets?: boolean;
  parking_spaces?: number;
  location_details?: Record<string, unknown>;
  location?: Record<string, unknown>;
  listing_type?: string;
  is_published?: boolean;
}

// ==========================================
// API METHODS
// ==========================================
export const landlordPropertiesApi = {
  /**
   * Fetches all properties owned by the authenticated landlord.
   */
  getProperties: async (): Promise<LandlordProperty[]> => {
    try {
      const response = await apiClient.get<RawPropertyResponse[] | { results: RawPropertyResponse[] }>(
        endpoints.PROPERTIES.LIST
      );
      const propertiesArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return propertiesArray.map((prop: RawPropertyResponse) => {
        const locationDetails = prop.location_details;
        const locationString = locationDetails
          ? `${locationDetails.estate || ""}, ${locationDetails.city || ""}`
              .replace(/^, |, $/g, "")
              .trim()
          : "Location not set";

        const isDelegated = prop.ownership_status === "delegated";
        const delegationInfo = prop.delegation_info || {};

        return {
          id: prop.id,
          delegation_id: prop.delegation_id || null,
          name: prop.title,
          location: locationString,
          total_units: prop.total_units || prop.total_units_capacity || 0,
          occupied_units: prop.occupied_units || 0,
          available_units: prop.available_units || 0,
          occupancy_rate: prop.occupancy_rate || 0,
          ownership_type: isDelegated ? "delegated" : "self_managed",
          is_delegated: isDelegated,
          agency_name: delegationInfo.agency_name || null,
          delegation_type: delegationInfo.delegation_type || null,
          delegation_status: delegationInfo.status || null,
          status: prop.is_active ? "active" : "inactive",
          is_published: prop.is_published || false,
        };
      });
    } catch (error) {
      console.error("Failed to fetch landlord properties:", error);
      return [];
    }
  },

  getPropertyDetail: async (id: number): Promise<LandlordPropertyDetail> => {
    try {
      const response = await apiClient.get<RawPropertyResponse>(
        endpoints.PROPERTIES.DETAIL(id)
      );
      const prop = response.data;

      const locationDetails = prop.location_details;
      const locationString = locationDetails
        ? `${locationDetails.estate || ""}, ${locationDetails.city || ""}`
            .replace(/^, |, $/g, "")
            .trim()
        : "Location not set";

      const isDelegated = prop.ownership_status === "delegated";
      const delegationInfo = prop.delegation_info || {};

      return {
        id: prop.id,
        delegation_id: prop.delegation_id || null,
        name: prop.title,
        location: locationString,
        total_units: prop.total_units || prop.total_units_capacity || 0,
        occupied_units: prop.occupied_units || 0,
        available_units: prop.available_units || 0,
        occupancy_rate: prop.occupancy_rate || 0,
        ownership_type: isDelegated ? "delegated" : "self_managed",
        is_delegated: isDelegated,
        agency_name: delegationInfo.agency_name || null,
        delegation_type: delegationInfo.delegation_type || null,
        delegation_status: delegationInfo.status || null,
        status: prop.is_active ? "active" : "inactive",
        is_published: prop.is_published || false,

        // Detail specific fields
        description: prop.description || "",
        property_category: prop.property_category || "",
        property_sub_type: prop.property_sub_type || "",
        construction_type: prop.construction_type || "",
        number_of_floors: prop.number_of_floors || 1,
        total_units_capacity: prop.total_units_capacity || 1,
        is_single_unit_property: prop.is_single_unit_property || false,
        has_water: prop.has_water || false,
        has_electricity: prop.has_electricity || false,
        has_internet: prop.has_internet || false,
        has_cctv: prop.has_cctv || false,
        has_elevator: prop.has_elevator || false,
        has_generator: prop.has_generator || false,
        has_gym: prop.has_gym || false,
        has_swimming_pool: prop.has_swimming_pool || false,
        allows_pets: prop.allows_pets || false,
        parking_spaces: prop.parking_spaces || 0,
        location_details: {
          estate: locationDetails?.estate || "",
          street: locationDetails?.street || "",
          city: locationDetails?.city || "",
          county: locationDetails?.county || "",
          region: locationDetails?.region || "",
          postal_code: locationDetails?.postal_code || "",
          landmark: locationDetails?.landmark || "",
          latitude: locationDetails?.latitude || undefined,
          longitude: locationDetails?.longitude || undefined,
        },
        listing_type: prop.listing_type || "",
        is_active: prop.is_active || false,
        cover_photo: prop.cover_photo || "",
      };
    } catch (error) {
      console.error("Failed to fetch property detail:", error);
      throw new Error("Property not found or access denied.");
    }
  },

  updateProperty: async (
    id: number,
    data: UpdatePropertyPayload
  ): Promise<LandlordPropertyDetail> => {
    // ✅ FIX: Clean destructuring prevents "unused variable" warnings and avoids 'any'
    const { location_details, ...rest } = data;
    const payload =
      location_details && !data.location
        ? { ...rest, location: location_details }
        : rest;

    const response = await apiClient.patch<LandlordPropertyDetail>(
      endpoints.PROPERTIES.DETAIL(id),
      payload
    );
    return response.data;
    },

  getPropertyMedia: async (propertyId: number): Promise<PropertyMedia[]> => {
    try {
      const response = await apiClient.get<
        RawMediaResponse[] | { results: RawMediaResponse[] }
      >(endpoints.PROPERTIES.MEDIA(propertyId));
      
      const mediaArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return mediaArray
        .filter((m: RawMediaResponse) => !m.unit && !m.unit_group)
        .map((m: RawMediaResponse) => ({
          id: m.id,
          media_type: m.media_type,
          file: m.file || "",
          url: m.file || m.url || "",
          caption: m.caption || "",
          display_order: m.display_order || 0,
          created_at: m.created_at || "",
        }));
    } catch (error) {
      console.error("Failed to fetch property media:", error);
      return [];
    }
  },

  uploadPropertyMedia: async (
    propertyId: number,
    file: File,
    mediaType: string,
    caption: string = ""
  ): Promise<PropertyMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);
    formData.append("caption", caption);

    const response = await apiClient.post<RawMediaResponse>(
      endpoints.PROPERTIES.MEDIA(propertyId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );

    const m = response.data;
    return {
      id: m.id,
      media_type: m.media_type,
      file: m.file || "",
      url: m.file || m.url || "",
      caption: m.caption || "",
      display_order: m.display_order || 0,
      created_at: m.created_at || "",
    };
  },

  deletePropertyMedia: async (
    propertyId: number,
    mediaId: number
  ): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId)
    );
  },

  updateCoverPhoto: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("cover_photo", file);
    const response = await apiClient.patch<{ cover_photo: string }>(
      endpoints.PROPERTIES.DETAIL(id),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return response.data.cover_photo || "";
  },

  updateMediaCaption: async (
    propertyId: number,
    mediaId: number,
    caption: string
  ): Promise<void> => {
    await apiClient.patch(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
      { caption }
    );
  },

  setCoverFromMedia: async (
    propertyId: number,
    mediaUrl: string
  ): Promise<string> => {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const filename = mediaUrl.split("/").pop() || "cover.jpg";
    const file = new File([blob], filename, { type: blob.type });
    return await landlordPropertiesApi.updateCoverPhoto(propertyId, file);
  },

  getPropertyTeam: async (propertyId: number): Promise<PropertyTeamMember[]> => {
    try {
      const response = await apiClient.get<PropertyTeamMember[]>(
        `/properties/${propertyId}/staff/`
      );
      return response.data;
    } catch (error) {
      console.error("Failed to fetch property team:", error);
      return [];
    }
  },

  // ==========================================
  // LANDLORD SPECIFIC: DELEGATION MANAGEMENT
  // ==========================================

  delegateProperty: async (
    propertyId: number,
    agencyId: number,
    delegationType: "full" | "partial" | "view_only",
    customPermissions?: Record<string, boolean>
  ): Promise<DelegationResponse> => {
    const response = await apiClient.post<DelegationResponse>(
      `/properties/${propertyId}/delegate/`,
      {
        agency_id: agencyId,
        delegation_type: delegationType,
        custom_permissions: customPermissions || {},
      }
    );
    return response.data;
  },

  revokeDelegation: async (
    delegationId: number,
    reason: string = ""
  ): Promise<void> => {
    await apiClient.post(`/agencies/delegations/${delegationId}/revoke/`, {
      reason,
    });
  },
};