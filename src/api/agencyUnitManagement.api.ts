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
}

export interface TenantFinancialInfo {
  tenant_id: number;
  tenant_name: string;
  tenant_email: string;
  tenant_phone: string;
  unit_code: string;
  rent_amount: number;
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
  // Unit Groups
  getUnitGroups: async (propertyId: number): Promise<UnitGroup[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.UNIT_GROUPS(propertyId),
      );
      return response.data;
    } catch (error) {
      // Mock data
      return [
        {
          id: 1,
          name: "Block A",
          description: "Two bedroom units",
          unit_type: "two_bedroom",
          floor_range: "1-3",
          billing_cycle: "monthly",
          billing_date: 5,
          base_rent_amount: 45000,
          service_charge: 2000,
          deposit_amount: 90000,
          currency: "KES",
          capacity: 12,
          allows_pets_override: null,
          is_active: true,
          cover_photo: "/media/unit-groups/block-a.jpg",
          units_count: 12,
        },
      ];
    }
  },

  // Units
  getUnits: async (propertyId: number): Promise<Unit[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.UNITS(propertyId),
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: 101,
          unit_code: "A-101",
          unit_type: "two_bedroom",
          floor_number: 1,
          rent_amount: 45000,
          deposit_amount: 90000,
          service_charge: 2000,
          currency: "KES",
          billing_cycle: "monthly",
          billing_date: 5,
          status: "occupied",
          allows_pets: false,
          parking_spaces: 1,
          cover_photo: "/media/units/a-101.jpg",
          created_at: "2026-01-15",
          unit_group_id: 1,
          unit_group_name: "Block A",
        },
      ];
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

  // Unit Media
  getUnitMedia: async (
    propertyId: number,
    unitId: number,
  ): Promise<UnitMedia[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, unitId),
      );
      return response.data;
    } catch (error) {
      return [];
    }
  },

  uploadUnitMedia: async (
    propertyId: number,
    unitId: number,
    file: File,
    mediaType: "image" | "video",
  ): Promise<UnitMedia> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("media_type", mediaType);

    const response = await apiClient.post(
      endpoints.PROPERTIES.MEDIA(propertyId),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
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

  // Tenant Financials
  getTenantFinancials: async (
    propertyId: number,
  ): Promise<TenantFinancialInfo[]> => {
    try {
      const response = await apiClient.get(
        `/api/properties/${propertyId}/tenant-financials/`,
      );
      return response.data;
    } catch (error) {
      return [
        {
          tenant_id: 1001,
          tenant_name: "John Doe",
          tenant_email: "john@email.com",
          tenant_phone: "+254712345678",
          unit_code: "A-101",
          rent_amount: 45000,
          deposit_amount: 90000,
          service_charge: 2000,
          balance_due: 0,
          arrears: 0,
          last_payment_date: "2026-06-05",
          last_payment_amount: 47000,
          next_billing_date: "2026-07-05",
          tenancy_status: "active",
          tenancy_start_date: "2026-01-01",
          tenancy_end_date: "2026-12-31",
          next_of_kin: {
            full_name: "Jane Doe",
            relationship: "Spouse",
            phone_number: "+254722333444",
            city: "Nairobi",
          },
        },
      ];
    }
  },
};
