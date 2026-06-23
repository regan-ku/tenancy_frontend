import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface UnitGroup {
  id: number;
  name: string;
  description: string;
  unit_type: string;
  floor_range: string;
  billing_cycle: string;
  billing_date: number;
  base_rent_amount: number;
  service_charge: number;
  deposit_amount: number;
  currency: string;
  capacity: number;
  allows_pets_override: boolean | null;
  is_active: boolean;
  cover_photo: string;
  units_count: number;
}

export interface Unit {
  id: number;
  unit_code: string;
  unit_type: string;
  floor_number: number;
  rent_amount: number;
  deposit_amount: number;
  service_charge: number;
  currency: string;
  billing_cycle: string;
  billing_date: number;
  status: "available" | "occupied" | "maintenance" | "reserved";
  allows_pets: boolean;
  parking_spaces: number;
  cover_photo: string;
  created_at: string;
  unit_group_id: number | null;
  unit_group_name: string | null;
}

export interface UnitMedia {
  id: number;
  media_type: "image" | "video";
  file: string;
  url: string;
  caption: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
  unit_id: number | null;
  unit_group_id: number | null;
}

export interface TenantFinancialInfo {
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  unit_code: string;
  rent_amount: number;
  property_name: string;
  deposit_amount: number;
  service_charge: number;
  balance_due: number;
  arrears: number;
  last_payment_date: string;
  last_payment_amount: number;
  next_billing_date: string;
  tenancy_status: "active" | "pending" | "terminated";
  tenancy_start_date: string;
  tenancy_end_date: string;
  next_of_kin: {
    full_name: string;
    relationship: string;
    phone_number: string;
    city: string;
  } | null;
}

// ==========================================
// API METHODS
// ==========================================
export const agencyUnitManagementApi = {
  // ==========================================
  // UNIT GROUPS
  // ==========================================
  getUnitGroups: async (propertyId: number): Promise<UnitGroup[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.UNIT_GROUPS(propertyId),
      );
      return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
    } catch (error) {
      console.error("Failed to fetch unit groups:", error);
      return [];
    }
  },

  updateUnitGroup: async (
    propertyId: number,
    groupId: number,
    data: FormData | Partial<UnitGroup>,
  ): Promise<UnitGroup> => {
    const isFormData = data instanceof FormData;
    const response = await apiClient.patch(
      endpoints.PROPERTIES.UNIT_GROUP_DETAIL(propertyId, groupId),
      data,
      isFormData ? { headers: { "Content-Type": "multipart/form-data" } } : {},
    );
    return response.data;
  },

  // ✅ NEW: DELETE UNIT GROUP (Backend enforces: cannot delete if occupied units exist)
  deleteUnitGroup: async (
    propertyId: number,
    groupId: number,
  ): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.UNIT_GROUP_DETAIL(propertyId, groupId),
    );
  },

  // ==========================================
  // UNITS
  // ==========================================
  getUnits: async (propertyId: number): Promise<Unit[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.UNITS(propertyId),
      );
      return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
    } catch (error) {
      console.error("Failed to fetch units:", error);
      return [];
    }
  },

  updateUnit: async (
    propertyId: number,
    unitId: number,
    data: Partial<Unit>,
  ): Promise<Unit> => {
    const response = await apiClient.patch(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
      data,
    );
    return response.data;
  },

  // ✅ NEW: ADD UNIT TO EXISTING GROUP (Inherits all group details automatically)
  addUnitToGroup: async (
    propertyId: number,
    groupId: number,
    floorNumber: number,
  ): Promise<Unit> => {
    const response = await apiClient.post(
      endpoints.PROPERTIES.UNITS(propertyId),
      {
        unit_group: groupId,
        floor_number: floorNumber,
      },
    );
    return response.data;
  },

  // ✅ NEW: DELETE UNIT (Backend enforces: cannot delete if unit is occupied)
  deleteUnit: async (propertyId: number, unitId: number): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
    );
  },

  // ==========================================
  // MEDIA
  // ==========================================
  getPropertyMedia: async (propertyId: number): Promise<UnitMedia[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.MEDIA(propertyId),
      );
      const mediaArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      return mediaArray.map((m: any) => ({
        id: m.id,
        media_type: m.media_type === "video" ? "video" : "image",
        file: m.file || "",
        url: m.file || m.url || "",
        caption: m.caption || "",
        display_order: m.display_order || 0,
        is_primary: m.is_primary || false,
        created_at: m.created_at || "",
        unit_id: m.unit || null,
        unit_group_id: m.unit_group || null,
      }));
    } catch (error) {
      console.error("Failed to fetch property media:", error);
      return [];
    }
  },

  getUnitMedia: async (
    propertyId: number,
    unitId: number,
  ): Promise<UnitMedia[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.MEDIA(propertyId),
      );
      const mediaArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      return mediaArray
        .filter(
          (m: any) => m.unit === unitId || String(m.unit) === String(unitId),
        )
        .map((m: any) => ({
          id: m.id,
          media_type: m.media_type === "video" ? "video" : "image",
          file: m.file || "",
          url: m.file || m.url || "",
          caption: m.caption || "",
          display_order: m.display_order || 0,
          is_primary: m.is_primary || false,
          created_at: m.created_at || "",
          unit_id: m.unit || null,
          unit_group_id: m.unit_group || null,
        }));
    } catch (error) {
      return [];
    }
  },

  uploadMedia: async (
    propertyId: number,
    file: File,
    mediaType: "image" | "video",
    target: { unit_id?: number; unit_group_id?: number },
  ): Promise<UnitMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);
    if (target.unit_id) formData.append("unit", target.unit_id.toString());
    if (target.unit_group_id)
      formData.append("unit_group", target.unit_group_id.toString());

    const response = await apiClient.post(
      endpoints.PROPERTIES.MEDIA(propertyId),
      formData,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    const m = response.data;
    return {
      id: m.id,
      media_type: m.media_type === "video" ? "video" : "image",
      file: m.file || "",
      url: m.file || m.url || "",
      caption: m.caption || "",
      display_order: m.display_order || 0,
      is_primary: m.is_primary || false,
      created_at: m.created_at || "",
      unit_id: m.unit || null,
      unit_group_id: m.unit_group || null,
    };
  },

  setPrimaryMedia: async (
    propertyId: number,
    mediaId: number,
  ): Promise<void> => {
    await apiClient.patch(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
      { is_primary: true },
    );
  },

  deleteMedia: async (propertyId: number, mediaId: number): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
    );
  },

  // ==========================================
  // TENANCY FINANCIALS
  // ==========================================
  getTenantFinancials: async (
    propertyId: number,
  ): Promise<TenantFinancialInfo[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.PROPERTIES.DETAIL(propertyId)}tenant-financials/`,
      );
      return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
    } catch (error) {
      console.error("❌ FAILED TO FETCH TENANT FINANCIALS:", error);
      return [];
    }
  },
};
