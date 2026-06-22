import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES (EXTENDED)
// ==========================================

// ... (Keep your existing AgencyDirector interfaces from Phase 7) ...

// ✅ NEW: DELEGATION INTERFACES
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

// ✅ NEW: AGENCY STAFF (AGENTS) INTERFACES
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

export interface CreateAgentPayload {
  full_name: string;
  email: string;
  phone: string;
  role: "agent" | "caretaker" | "property_manager";
}

// ==========================================
// API METHODS (EXTENDED)
// ==========================================
export const agenciesApi = {
  // ... (Keep your existing getDirectors, addDirector, removeDirector methods) ...

  // ✅ NEW: DELEGATION METHODS
  getDelegations: async (): Promise<PropertyDelegation[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.AGENCIES.LIST}1/delegations/`,
      ); // Mock ID 1
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

  acceptDelegation: async (delegationId: number): Promise<void> => {
    await apiClient.post(
      `${endpoints.AGENCIES.LIST}1/delegations/${delegationId}/accept/`,
    );
  },

  // ✅ NEW: STAFF (AGENTS) METHODS
  getAgencyStaff: async (): Promise<AgencyStaff[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.AGENCIES.LIST}1/staff/`,
      );
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
      ];
    }
  },

  createStaff: async (data: CreateAgentPayload): Promise<AgencyStaff> => {
    const response = await apiClient.post(
      `${endpoints.AGENCIES.LIST}1/staff/`,
      data,
    );
    return response.data;
  },
};
