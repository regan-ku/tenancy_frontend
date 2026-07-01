import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type AgencyRole = "property_manager" | "agent" | "caretaker";

export interface AgencyStaffMember {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: AgencyRole;
  is_active: boolean;
  date_joined: string;
}

export interface CreateStaffPayload {
  full_name: string;
  email: string;
  phone_number: string;
  role: AgencyRole;
}

export interface CreateStaffResponse {
  message: string;
  staff_id: number;
  email: string;
  role: string;
  temp_password: string;
}

export interface AccessibleProperty {
  id: number;
  title: string;
}

// ✅ NEW: Interface for Property Assignments (Manage Access Modal)
export interface PropertyAssignment {
  assignment_id: number;
  property_id: number;
  property_name: string;
  operational_role: string;
  assigned_by_agency: string;
  assigned_at: string;
}

// ==========================================
// API METHODS
// ==========================================
export const agencyStaffApi = {
  getStaff: async (): Promise<AgencyStaffMember[]> => {
    const response = await apiClient.get(
      "/accounts/applicant-management/list-staff/",
    );
    return response.data;
  },

  createStaff: async (
    data: CreateStaffPayload,
  ): Promise<CreateStaffResponse> => {
    const response = await apiClient.post(
      "/accounts/applicant-management/create-staff/",
      data,
    );
    return response.data;
  },

  getAccessibleProperties: async (
    availableForRole?: string,
  ): Promise<AccessibleProperty[]> => {
    let url = "/properties/properties/";
    if (availableForRole) {
      url += `?available_for_role=${availableForRole}`;
    }

    const response = await apiClient.get(url);
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (data.results) return data.results;
    return [];
  },

  assignStaffToProperties: async (
    userId: number,
    operationalRole: string,
    propertyIds: number[],
  ): Promise<void> => {
    const promises = propertyIds.map((propertyId) =>
      apiClient.post(`/properties/properties/${propertyId}/staff/assign/`, {
        user_id: userId,
        operational_role: operationalRole,
        notes: "Assigned via Staff Management Dashboard",
      }),
    );
    await Promise.all(promises);
  },

  removeStaffFromProperty: async (
    userId: number,
    propertyId: number,
  ): Promise<void> => {
    await apiClient.post(
      `/properties/properties/${propertyId}/staff/${userId}/terminate/`,
    );
  },

  deactivateStaff: async (staffId: number, reason: string): Promise<void> => {
    await apiClient.patch(
      `/accounts/applicant-management/${staffId}/deactivate/`,
      { reason: reason },
    );
  },

  // ✅ NEW: Fetch assignments for a specific staff member
  getStaffAssignments: async (
    staffId: number,
  ): Promise<PropertyAssignment[]> => {
    const response = await apiClient.get(
      `/accounts/applicant-management/${staffId}/assignments/`,
    );
    return response.data;
  },
};
