import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { useAuthStore } from "@/store/auth.store";

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
  address: string;
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
  address: string;
  ownership_percentage: number;
  is_primary_director: boolean;
}

// ==========================================
// INTERFACES: DELEGATIONS & STAFF
// ==========================================
export interface PropertyDelegation {
  id: number;
  property_name: string;
  property_location: string;
  landlord_name: string;
  delegation_type: "full" | "partial" | "view_only";
  permissions: string[];
  status: "pending" | "active" | "revoked";
  total_units: number;
  assigned_staff_count: number;
  created_at: string;
}

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
  // Helper to get the current user's agency ID dynamically
  getCurrentAgency: async (): Promise<any | null> => {
    try {
      const response = await apiClient.get(endpoints.AGENCIES.LIST);
      const agencies = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      if (agencies.length === 0) return null;

      const { user } = useAuthStore.getState();
      return (
        agencies.find((a: any) => a.created_by === user?.id) || agencies[0]
      );
    } catch (error) {
      return null;
    }
  },

  // 1. DIRECTORS
  getDirectors: async (agencyId: number): Promise<AgencyDirector[]> => {
    const response = await apiClient.get(
      endpoints.AGENCIES.DIRECTORS(agencyId),
    );
    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
  },

  addDirector: async (agencyId: number, data: any): Promise<AgencyDirector> => {
    const response = await apiClient.post(
      endpoints.AGENCIES.DIRECTORS(agencyId),
      data,
    );
    return response.data;
  },

  // ✅ NEW: Update Director API Method
  updateDirector: async (
    agencyId: number,
    directorId: number,
    data: Partial<CreateDirectorPayload>,
  ): Promise<AgencyDirector> => {
    const response = await apiClient.patch(
      `${endpoints.AGENCIES.DIRECTORS(agencyId)}${directorId}/`,
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

  // 2. DELEGATIONS
  getDelegations: async (agencyId: number): Promise<PropertyDelegation[]> => {
    const response = await apiClient.get(
      endpoints.AGENCIES.DELEGATIONS(agencyId),
    );
    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
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

  // 3. STAFF
  getAgencyStaff: async (agencyId: number): Promise<AgencyStaff[]> => {
    const response = await apiClient.get(endpoints.AGENCIES.STAFF(agencyId));
    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
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
