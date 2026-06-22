import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES (Expanded to match backend Property model)
// ==========================================
export interface AgencyProperty {
  id: number;
  name: string;
  location: string;
  total_units: number;
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

  // Amenities
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

  // Location (Nested object from backend)
  location_details: {
    estate: string;
    street: string;
    city: string;
    county: string;
    region: string;
    postal_code: string;
    landmark: string;
  };

  // Marketplace & Status
  listing_type: string;
  is_published: boolean;
  is_active: boolean;
  cover_photo: string;
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
          name: prop.title,
          location: locationString,
          total_units: prop.total_units_capacity || 0,
          occupancy_rate: 0,
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
        name: prop.title,
        location: locationString,
        total_units: prop.total_units_capacity || 0,
        occupancy_rate: 0,
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

        // ✅ Map all the new detailed fields
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
      throw new Error("Property not found or access denied.");
    }
  },

  // ✅ NEW: Update Property Method
  updateProperty: async (id: number, data: any): Promise<any> => {
    // The backend PropertySerializer expects 'location' as a nested object for updates
    const payload = { ...data, location: data.location_details };
    delete payload.location_details;

    const response = await apiClient.patch(
      endpoints.PROPERTIES.DETAIL(id),
      payload,
    );
    return response.data;
  },
};
