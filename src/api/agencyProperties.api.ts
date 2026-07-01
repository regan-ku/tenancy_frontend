import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface AgencyProperty {
  id: number;
  delegation_id?: number | null; // ✅ NEW: Required to call the relinquish endpoint
  name: string;
  location: string;
  total_units: number;
  occupied_units: number;
  available_units: number;
  occupancy_rate: number;
  ownership_type: "owned" | "delegated";
  landlord_name: string;
  delegation_type: "full" | "partial" | "view_only";
  permissions: {
    can_edit_overview: boolean;
    can_manage_units: boolean;
    can_view_tenants: boolean;
    can_view_financials: boolean;
  };
  status: "active" | "inactive";
}

export interface AgencyPropertyDetail extends AgencyProperty {
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
  is_published: boolean;
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

// ==========================================
// API METHODS
// ==========================================
export const agencyPropertiesApi = {
  getManagedProperties: async (): Promise<AgencyProperty[]> => {
    try {
      const response = await apiClient.get(endpoints.PROPERTIES.LIST);
      const propertiesArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return propertiesArray.map((prop: any) => {
        const locationDetails = prop.location_details;
        const locationString = locationDetails
          ? `${locationDetails.estate || ""}, ${locationDetails.city || ""}`.replace(
              /^, |, $/g,
              "",
            )
          : "Location not set";

        const isDelegated = prop.ownership_status === "delegated";
        const delegationInfo = prop.delegation_info || {};
        const customPerms = delegationInfo.custom_permissions || {};
        const hasFullAccess =
          delegationInfo.delegation_type === "full" ||
          Object.keys(customPerms).length === 0;

        return {
          id: prop.id,
          delegation_id: prop.delegation_id || null, // ✅ NEW
          name: prop.title,
          location: locationString,
          total_units: prop.total_units || prop.total_units_capacity || 0,
          occupied_units: prop.occupied_units || 0,
          available_units: prop.available_units || 0,
          occupancy_rate: prop.occupancy_rate || 0,
          ownership_type: isDelegated ? "delegated" : "owned",
          landlord_name: prop.landlord_name || "Unknown Owner",
          delegation_type: delegationInfo.delegation_type || "full",
          permissions: {
            can_edit_overview:
              hasFullAccess || customPerms.manage_property !== false,
            can_manage_units:
              hasFullAccess || customPerms.manage_units !== false,
            can_view_tenants:
              hasFullAccess || customPerms.manage_tenants !== false,
            can_view_financials:
              hasFullAccess || customPerms.collect_payments !== false,
          },
          status: prop.is_active ? "active" : "inactive",
        };
      });
    } catch (error) {
      console.error("Failed to fetch properties:", error);
      return [];
    }
  },

  getPropertyDetail: async (id: number): Promise<AgencyPropertyDetail> => {
    try {
      const response = await apiClient.get(endpoints.PROPERTIES.DETAIL(id));
      const prop = response.data;

      const locationDetails = prop.location_details;
      const locationString = locationDetails
        ? `${locationDetails.estate || ""}, ${locationDetails.city || ""}`.replace(
            /^, |, $/g,
            "",
          )
        : "Location not set";

      const isDelegated = prop.ownership_status === "delegated";
      const delegationInfo = prop.delegation_info || {};
      const customPerms = delegationInfo.custom_permissions || {};
      const hasFullAccess =
        delegationInfo.delegation_type === "full" ||
        Object.keys(customPerms).length === 0;

      return {
        id: prop.id,
        delegation_id: prop.delegation_id || null, // ✅ NEW
        name: prop.title,
        location: locationString,
        total_units: prop.total_units || prop.total_units_capacity || 0,
        occupied_units: prop.occupied_units || 0,
        available_units: prop.available_units || 0,
        occupancy_rate: prop.occupancy_rate || 0,
        ownership_type: isDelegated ? "delegated" : "owned",
        landlord_name: prop.landlord_name || "Unknown Owner",
        delegation_type: delegationInfo.delegation_type || "full",
        permissions: {
          can_edit_overview:
            hasFullAccess || customPerms.manage_property !== false,
          can_manage_units: hasFullAccess || customPerms.manage_units !== false,
          can_view_tenants:
            hasFullAccess || customPerms.manage_tenants !== false,
          can_view_financials:
            hasFullAccess || customPerms.collect_payments !== false,
        },
        status: prop.is_active ? "active" : "inactive",
        description: prop.description || "",
        property_category: prop.property_category || "",
        property_sub_type: prop.property_sub_type || "",
        construction_type: prop.construction_type || "",
        number_of_floors: prop.number_of_floors || 1,
        total_units_capacity: prop.total_units_capacity || 1,
        is_single_unit_property: prop.is_single_unit_property || false,
        has_water: prop.has_water,
        has_electricity: prop.has_electricity,
        has_internet: prop.has_internet,
        has_cctv: prop.has_cctv,
        has_elevator: prop.has_elevator,
        has_generator: prop.has_generator,
        has_gym: prop.has_gym,
        has_swimming_pool: prop.has_swimming_pool,
        allows_pets: prop.allows_pets,
        parking_spaces: prop.parking_spaces || 0,
        location_details: prop.location_details || {},
        listing_type: prop.listing_type || "",
        is_published: prop.is_published || false,
        is_active: prop.is_active || false,
        cover_photo: prop.cover_photo || "",
      };
    } catch (error) {
      console.error("Failed to fetch property detail:", error);
      throw new Error("Property not found or access denied.");
    }
  },

  updateProperty: async (id: number, data: any): Promise<any> => {
    const payload = { ...data };

    if (payload.location_details && !payload.location) {
      payload.location = payload.location_details;
      delete payload.location_details;
    }

    const response = await apiClient.patch(
      endpoints.PROPERTIES.DETAIL(id),
      payload,
    );
    return response.data;
  },

  getPropertyMedia: async (propertyId: number): Promise<PropertyMedia[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.MEDIA(propertyId),
      );
      const mediaArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return mediaArray
        .filter((m: any) => !m.unit && !m.unit_group)
        .map((m: any) => ({
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
    caption: string = "",
  ): Promise<PropertyMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);
    formData.append("caption", caption);

    const response = await apiClient.post(
      endpoints.PROPERTIES.MEDIA(propertyId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
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
    mediaId: number,
  ): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
    );
  },

  updateCoverPhoto: async (id: number, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("cover_photo", file);
    const response = await apiClient.patch(
      endpoints.PROPERTIES.DETAIL(id),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data.cover_photo || "";
  },

  updateMediaCaption: async (
    propertyId: number,
    mediaId: number,
    caption: string,
  ): Promise<void> => {
    await apiClient.patch(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
      { caption },
    );
  },

  setCoverFromMedia: async (
    propertyId: number,
    mediaUrl: string,
  ): Promise<string> => {
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const filename = mediaUrl.split("/").pop() || "cover.jpg";
    const file = new File([blob], filename, { type: blob.type });
    return await agencyPropertiesApi.updateCoverPhoto(propertyId, file);
  },

  getPropertyTeam: async (
    propertyId: number,
  ): Promise<PropertyTeamMember[]> => {
    try {
      const response = await apiClient.get(`/properties/${propertyId}/staff/`);
      return response.data;
    } catch (error) {
      console.error("Failed to fetch property team:", error);
      return [];
    }
  },

  // ✅ NEW: Relinquish Delegation
  relinquishProperty: async (
    delegationId: number,
    reason: string,
  ): Promise<void> => {
    await apiClient.post(`/agencies/delegations/${delegationId}/relinquish/`, {
      reason,
    });
  },
};
