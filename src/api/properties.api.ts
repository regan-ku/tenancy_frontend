import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// ENUMS & TYPES (Strictly from OpenAPI Schema)
// ==========================================
export type PropertyCategory =
  | "residential"
  | "commercial"
  | "hospitality"
  | "industrial"
  | "land"
  | "mixed_use";
export type PropertySubType =
  | "apartment"
  | "flat"
  | "bungalow"
  | "mansion"
  | "villa"
  | "townhouse"
  | "maisonette"
  | "bedsitter"
  | "studio"
  | "single_room"
  | "hostel"
  | "office_space"
  | "retail_shop"
  | "warehouse"
  | "airbnb"
  | "hotel"
  | "guest_house"
  | "serviced_apartment"
  | "residential_plot"
  | "commercial_land"
  | "agricultural_land";
export type UnitType =
  | "single_room"
  | "bedsitter"
  | "studio"
  | "one_bedroom"
  | "two_bedroom"
  | "three_bedroom"
  | "four_plus_bedroom"
  | "penthouse"
  | "commercial_space"
  | "land_plot"
  | "parking_bay";
export type BillingCycle =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "yearly";
export type MediaType =
  | "image"
  | "video"
  | "virtual_tour"
  | "floor_plan"
  | "document";
export type UnitStatus =
  | "available"
  | "occupied"
  | "reserved"
  | "maintenance"
  | "out_of_service";

// ==========================================
// INTERFACES (READ MODELS - From Backend)
// ==========================================
export interface Location {
  estate?: string | null;
  street?: string | null;
  city: string;
  county: string;
  region?: string | null;
  postal_code?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface Property {
  id: number;
  title: string;
  description?: string | null;
  cover_photo?: string | null;
  created_by_email: string;
  ownership_status?: "owned" | "delegated" | "relinquished";
  property_category: PropertyCategory;
  property_sub_type: PropertySubType;
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
  is_active: boolean;
  location_details: Location;
}

export interface UnitGroup {
  id: number;
  name: string;
  description?: string | null;
  unit_type: UnitType;
  floor_range: string;
  billing_cycle: BillingCycle;
  billing_date: number;
  base_rent_amount: string;
  service_charge_amount: string;
  deposit_amount: string;
  currency: string;
  capacity: number;
  allows_pets_override?: boolean | null;
  is_active?: boolean;
  cover_photo?: string | null;
}

export interface Unit {
  id: number;
  property_title: string;
  unit_group?: number;
  unit_group_name?: string | null;
  unit_code: string;
  unit_type: UnitType;
  floor_number: number;
  rent_amount: string;
  deposit_amount: string;
  service_charge: string;
  currency: string;
  billing_cycle: BillingCycle;
  billing_date: number;
  status: UnitStatus;
  allows_pets: boolean;
  parking_spaces: number;
  cover_photo?: string | null;
  created_at: string;
}

export interface PropertyMedia {
  id: number;
  property_ref: number;
  property_title?: string | null;
  unit?: number | null;
  unit_group?: number | null; // ✅ ADDED: Links media to a specific unit group
  media_type: MediaType;
  file: string;
  url?: string | null;
  caption?: string | null;
  display_order: number;
  created_at: string;
}

// ==========================================
// REQUEST INTERFACES (WRITE MODELS)
// ==========================================
export interface LocationRequest {
  estate?: string | null;
  street?: string | null;
  city: string;
  county: string;
  region?: string | null;
  postal_code?: string | null;
  latitude?: string | null;
  longitude?: string | null;
}

export interface UnitStatusUpdateRequest {
  status: UnitStatus;
}

// ==========================================
// API METHODS (Complete CRUD)
// ==========================================
export const propertiesApi = {
  // 1. PROPERTY CRUD
  listProperties: async (
    params?: Record<string, any>,
  ): Promise<{ results: Property[] }> => {
    const response = await apiClient.get(endpoints.PROPERTIES.LIST, { params });
    return response.data;
  },
  getProperty: async (id: number): Promise<Property> => {
    const response = await apiClient.get(endpoints.PROPERTIES.DETAIL(id));
    return response.data;
  },
  createProperty: async (data: any): Promise<Property> => {
    const response = await apiClient.post(endpoints.PROPERTIES.LIST, data);
    return response.data;
  },
  updateProperty: async (id: number, data: any): Promise<Property> => {
    // ✅ The axios.ts interceptor handles the Content-Type for FormData automatically
    const response = await apiClient.patch(
      endpoints.PROPERTIES.DETAIL(id),
      data,
    );
    return response.data;
  },
  deleteProperty: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.PROPERTIES.DETAIL(id));
  },

  // 2. UNIT GROUPS
  getUnitGroups: async (
    propertyId: number,
  ): Promise<{ results: UnitGroup[] }> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.UNIT_GROUPS(propertyId),
    );
    return response.data;
  },
  getUnitGroupDetail: async (
    propertyId: number,
    groupId: number,
  ): Promise<UnitGroup> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.UNIT_GROUP_DETAIL(propertyId, groupId),
    );
    return response.data;
  },
  createUnitGroup: async (
    propertyId: number,
    data: Partial<UnitGroup>,
  ): Promise<UnitGroup> => {
    const response = await apiClient.post(
      endpoints.PROPERTIES.UNIT_GROUPS(propertyId),
      data,
    );
    return response.data;
  },
  updateUnitGroup: async (
    propertyId: number,
    groupId: number,
    data: any, // ✅ Accepts FormData for cover_photo uploads
  ): Promise<UnitGroup> => {
    const response = await apiClient.patch(
      endpoints.PROPERTIES.UNIT_GROUP_DETAIL(propertyId, groupId),
      data,
    );
    return response.data;
  },
  deleteUnitGroup: async (
    propertyId: number,
    groupId: number,
  ): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.UNIT_GROUP_DETAIL(propertyId, groupId),
    );
  },
  generateUnits: async (
    propertyId: number,
    groupId: number,
  ): Promise<{ results: Unit[] }> => {
    const response = await apiClient.post(
      endpoints.PROPERTIES.GENERATE_UNITS(propertyId, groupId),
    );
    return response.data;
  },

  finalizeUnitGroups: async (
    propertyId: number,
    data: { unit_groups: any[] },
  ): Promise<UnitGroup[]> => {
    const response = await apiClient.post(
      endpoints.PROPERTIES.FINALIZE_UNIT_GROUPS(propertyId),
      data,
    );
    return response.data;
  },

  // 3. UNITS
  getUnits: async (propertyId: number): Promise<{ results: Unit[] }> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.UNITS(propertyId),
    );

    // ✅ BULLETPROOF FIX: Handle both paginated ({ results: [] }) and plain array ([]) responses
    if (Array.isArray(response.data)) {
      return { results: response.data };
    }

    return response.data || { results: [] };
  },
  getUnitDetail: async (propertyId: number, unitId: number): Promise<Unit> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
    );
    return response.data;
  },
  getUnitById: async (propertyId: number, unitId: number): Promise<any> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
    );
    return response.data;
  },
  updateUnit: async (
    propertyId: number,
    unitId: number,
    data: any,
  ): Promise<Unit> => {
    const response = await apiClient.patch(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
      data,
    );
    return response.data;
  },
  deleteUnit: async (propertyId: number, unitId: number): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.UNIT_DETAIL(propertyId, unitId),
    );
  },
  updateUnitStatus: async (
    propertyId: number,
    unitId: number,
    data: UnitStatusUpdateRequest,
  ): Promise<Unit> => {
    const response = await apiClient.patch(
      endpoints.PROPERTIES.UPDATE_UNIT_STATUS(propertyId, unitId),
      data,
    );
    return response.data;
  },

  // 4. MEDIA
  getPropertyMedia: async (
    propertyId: number,
  ): Promise<{ results: PropertyMedia[] }> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.MEDIA(propertyId),
    );
    return response.data;
  },
  getMediaDetail: async (
    propertyId: number,
    mediaId: number,
  ): Promise<PropertyMedia> => {
    const response = await apiClient.get(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
    );
    return response.data;
  },

  // ✅🚨 CRITICAL FIX: Removed manual headers!
  uploadPropertyMedia: async (
    propertyId: number,
    data: FormData,
  ): Promise<PropertyMedia> => {
    // By NOT setting headers manually, the axios.ts interceptor will delete the
    // default Content-Type, allowing the browser to set 'multipart/form-data'
    // WITH the correct cryptographic boundary.
    const response = await apiClient.post(
      endpoints.PROPERTIES.MEDIA(propertyId),
      data,
    );
    return response.data;
  },

  updateMedia: async (
    propertyId: number,
    mediaId: number,
    data: FormData,
  ): Promise<PropertyMedia> => {
    const response = await apiClient.patch(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
      data,
    );
    return response.data;
  },
  deleteMedia: async (propertyId: number, mediaId: number): Promise<void> => {
    await apiClient.delete(
      endpoints.PROPERTIES.MEDIA_DETAIL(propertyId, mediaId),
    );
  },
};
