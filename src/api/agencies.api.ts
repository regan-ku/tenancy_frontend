import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES: AGENCY DIRECTORS
// ==========================================
export interface AgencyDirector {
  id: number;
  full_name: string;
  national_id?: string;
  passport_number?: string;
  email: string;
  phone_number: string;
  nationality: string;
  address?: string;
  ownership_percentage: number;
  is_primary_director: boolean;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  created_at: string;
}

export interface CreateDirectorPayload {
  full_name: string;
  national_id?: string;
  passport_number?: string;
  email: string;
  phone_number: string;
  nationality: string;
  address?: string;
  ownership_percentage: number;
  is_primary_director: boolean;
}

// ==========================================
// INTERFACES: DELEGATIONS
// ==========================================
export interface PropertyDelegation {
  id: number;
  property_name: string;
  property_location: string;
  landlord_name: string;
  delegation_type: "full" | "partial" | "view_only";
  permissions: string[]; // e.g., ["manage_tenants", "collect_rent", "maintenance"]
  status: "pending" | "active" | "revoked";
  total_units: number;
  assigned_staff_count: number;
  created_at: string;
}

// ==========================================
// INTERFACES: AGENCY STAFF (AGENTS/CARETAKERS)
// ==========================================
export interface AgencyStaff {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: "agent" | "caretaker" | "property_manager";
  assigned_properties: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateStaffPayload {
  full_name: string;
  email: string;
  phone: string;
  role: "agent" | "caretaker" | "property_manager";
}

// ==========================================
// API METHODS
// ==========================================
export const agenciesApi = {
  // ==========================================
  // 1. DIRECTORS
  // ==========================================
  getDirectors: async (agencyId: number = 1): Promise<AgencyDirector[]> => {
    try {
      const response = await apiClient.get(
        endpoints.AGENCIES.DIRECTORS(agencyId),
      );
      return response.data;
    } catch (error) {
      // Mock fallback data
      return [
        {
          id: 1,
          full_name: "Jane Mwangi",
          national_id: "12345678",
          email: "jane@nairobipremier.co.ke",
          phone_number: "+254700000001",
          nationality: "Kenyan",
          ownership_percentage: 60,
          is_primary_director: true,
          verification_status: "verified",
          created_at: "2026-01-05",
        },
        {
          id: 2,
          full_name: "Peter Ochieng",
          passport_number: "P9876543",
          email: "peter@nairobipremier.co.ke",
          phone_number: "+254700000002",
          nationality: "Kenyan",
          ownership_percentage: 40,
          is_primary_director: false,
          verification_status: "pending",
          created_at: "2026-01-05",
        },
      ];
    }
  },

  addDirector: async (
    agencyId: number,
    data: CreateDirectorPayload,
  ): Promise<AgencyDirector> => {
    const response = await apiClient.post(
      endpoints.AGENCIES.DIRECTORS(agencyId),
      data,
    );
    return response.data;
  },

  removeDirector: async (
    agencyId: number,
    directorId: number,
  ): Promise<void> => {
    await apiClient.delete(
      `${endpoints.AGENCIES.DIRECTORS(agencyId)}${directorId}/`,
    );
  },

  verifyDirector: async (
    agencyId: number,
    directorId: number,
  ): Promise<void> => {
    await apiClient.patch(
      `${endpoints.AGENCIES.DIRECTORS(agencyId)}${directorId}/verify/`,
    );
  },

  // ==========================================
  // 2. DELEGATIONS
  // ==========================================
  getDelegations: async (
    agencyId: number = 1,
  ): Promise<PropertyDelegation[]> => {
    try {
      const response = await apiClient.get(
        endpoints.AGENCIES.DELEGATIONS(agencyId),
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: 101,
          property_name: "Myles Apartment",
          property_location: "Kilimani, Nairobi",
          landlord_name: "David Miller",
          delegation_type: "full",
          permissions: [
            "manage_tenants",
            "collect_rent",
            "maintenance",
            "listings",
          ],
          status: "active",
          total_units: 24,
          assigned_staff_count: 2,
          created_at: "2026-01-15",
        },
        {
          id: 102,
          property_name: "Westlands Commercial Plaza",
          property_location: "Westlands, Nairobi",
          landlord_name: "Sarah Connor",
          delegation_type: "partial",
          permissions: ["maintenance", "listings"],
          status: "active",
          total_units: 12,
          assigned_staff_count: 1,
          created_at: "2026-03-10",
        },
        {
          id: 103,
          property_name: "Lavington Villas",
          property_location: "Lavington, Nairobi",
          landlord_name: "John Doe",
          delegation_type: "full",
          permissions: [
            "manage_tenants",
            "collect_rent",
            "maintenance",
            "listings",
          ],
          status: "pending",
          total_units: 8,
          assigned_staff_count: 0,
          created_at: "2026-06-18",
        },
      ];
    }
  },

  acceptDelegation: async (
    agencyId: number,
    delegationId: number,
  ): Promise<void> => {
    await apiClient.post(
      `${endpoints.AGENCIES.DELEGATIONS(agencyId)}${delegationId}/accept/`,
    );
  },

  revokeDelegation: async (
    agencyId: number,
    delegationId: number,
  ): Promise<void> => {
    await apiClient.post(
      `${endpoints.AGENCIES.DELEGATIONS(agencyId)}${delegationId}/revoke/`,
    );
  },

  // ==========================================
  // 3. STAFF (AGENTS / CARETAKERS / PROPERTY MANAGERS)
  // ==========================================
  getAgencyStaff: async (agencyId: number = 1): Promise<AgencyStaff[]> => {
    try {
      const response = await apiClient.get(endpoints.AGENCIES.STAFF(agencyId));
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          full_name: "Alice Agent",
          email: "alice@agency.com",
          phone: "+254711222333",
          role: "agent",
          assigned_properties: 2,
          is_active: true,
          created_at: "2026-02-01",
        },
        {
          id: 2,
          full_name: "Bob Manager",
          email: "bob@agency.com",
          phone: "+254722333444",
          role: "property_manager",
          assigned_properties: 5,
          is_active: true,
          created_at: "2026-01-05",
        },
        {
          id: 3,
          full_name: "James Mwangi",
          email: "james@agency.com",
          phone: "+254733444555",
          role: "caretaker",
          assigned_properties: 3,
          is_active: true,
          created_at: "2026-03-12",
        },
      ];
    }
  },

  createStaff: async (
    agencyId: number,
    data: CreateStaffPayload,
  ): Promise<AgencyStaff> => {
    const response = await apiClient.post(
      endpoints.AGENCIES.STAFF(agencyId),
      data,
    );
    return response.data;
  },

  deactivateStaff: async (agencyId: number, staffId: number): Promise<void> => {
    await apiClient.post(
      `${endpoints.AGENCIES.STAFF(agencyId)}${staffId}/deactivate/`,
    );
  },
};
