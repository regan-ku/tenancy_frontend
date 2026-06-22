import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// 1. AGENCY DIRECTORS INTERFACES
// ==========================================
export interface AgencyDirector {
  id: number;
  user?: number; // Linked User ID (if backend links to an existing user)
  full_name: string;
  national_id?: string;
  passport_number?: string;
  email: string;
  phone_number: string;
  nationality: string;
  address: string;
  ownership_percentage: number;
  is_primary_director: boolean;
  verification_status: "pending" | "verified" | "rejected" | "suspended";
  created_at?: string;
}

export interface CreateDirectorPayload {
  full_name: string;
  national_id?: string;
  passport_number?: string;
  email: string;
  phone_number: string;
  nationality: string;
  address: string;
  ownership_percentage: number;
  is_primary_director: boolean;
}

// ==========================================
// 2. PROPERTY DELEGATIONS INTERFACES
// ==========================================
export interface PropertyDelegation {
  id: number;
  property_ref: number; // The actual Property ID
  property_name: string; // Injected by serializer for UI display
  property_location?: string; // Injected by serializer for UI display
  landlord_name?: string; // Injected by serializer for UI display
  delegation_type: "full" | "partial" | "view_only";
  custom_permissions: Record<string, boolean>; // JSON field from backend
  status: "active" | "revoked" | "expired" | "pending";
  start_date: string;
  end_date?: string;
  created_at?: string;
}

// ==========================================
// 3. AGENCY STAFF (AGENTS/CARETAKERS) INTERFACES
// ==========================================
export interface AgencyStaff {
  id: number;
  user: number; // The actual User ID being added as staff
  user_email: string; // Injected by serializer
  role:
    | "agent"
    | "caretaker"
    | "property_manager"
    | "admin_staff"
    | "supervisor";
  status: "active" | "inactive";
  contact_phone: string;
  contact_email: string;
  joined_at: string;
}

export interface CreateStaffPayload {
  user: number; // ID of the existing user to assign as staff
  role:
    | "agent"
    | "caretaker"
    | "property_manager"
    | "admin_staff"
    | "supervisor";
  contact_phone?: string;
  contact_email?: string;
}

// ==========================================
// API METHODS
// ==========================================
export const agenciesApi = {
  // ==========================================
  // DIRECTORS
  // ==========================================
  getDirectors: async (agencyId: number): Promise<AgencyDirector[]> => {
    const response = await apiClient.get(
      endpoints.AGENCIES.DIRECTORS(agencyId),
    );
    return response.data;
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
    // Standard DRF delete endpoint
    await apiClient.delete(
      `${endpoints.AGENCIES.DIRECTORS(agencyId)}${directorId}/`,
    );
  },

  // ==========================================
  // DELEGATIONS
  // ==========================================
  getDelegations: async (agencyId: number): Promise<PropertyDelegation[]> => {
    const response = await apiClient.get(
      endpoints.AGENCIES.DELEGATIONS(agencyId),
    );
    return response.data;
  },

  acceptDelegation: async (
    agencyId: number,
    delegationId: number,
  ): Promise<void> => {
    // Patching status to active (or hit a specific accept endpoint if you add one to the backend)
    await apiClient.patch(
      `${endpoints.AGENCIES.DELEGATIONS(agencyId)}${delegationId}/`,
      { status: "active" },
    );
  },

  revokeDelegation: async (
    agencyId: number,
    delegationId: number,
  ): Promise<void> => {
    // Hitting the custom revoke action defined in your DelegationViewSet
    await apiClient.post(
      `${endpoints.AGENCIES.DELEGATIONS(agencyId)}${delegationId}/revoke/`,
    );
  },

  // ==========================================
  // STAFF (AGENTS & CARETAKERS)
  // ==========================================
  getAgencyStaff: async (agencyId: number): Promise<AgencyStaff[]> => {
    const response = await apiClient.get(endpoints.AGENCIES.STAFF(agencyId));
    return response.data;
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
    // Hitting the custom deactivate action defined in your AgencyStaffViewSet
    await apiClient.post(
      `${endpoints.AGENCIES.STAFF(agencyId)}${staffId}/deactivate/`,
    );
  },
};
