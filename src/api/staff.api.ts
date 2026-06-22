import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface CaretakerPermissions {
  can_manage_maintenance: boolean;
  can_conduct_inspections: boolean;
  can_view_tenant_contacts: boolean;
  can_track_utilities: boolean;
  // Hard-restricted by system architecture (Always false for caretakers)
  can_view_financials: false;
  can_edit_leases: false;
}

export interface Caretaker {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  assigned_properties: number[]; // Array of Property IDs
  permissions: CaretakerPermissions;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
}

export interface CreateCaretakerPayload {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  permissions: CaretakerPermissions;
}

// ==========================================
// API METHODS
// ==========================================
export const staffApi = {
  getCaretakers: async (): Promise<Caretaker[]> => {
    try {
      const response = await apiClient.get("/api/accounts/staff/caretakers/");
      return response.data;
    } catch (error) {
      // Mock Data for UI building
      return [
        {
          id: 1,
          full_name: "James Mwangi",
          email: "james.m@tennacy.com",
          phone: "+254722111222",
          assigned_properties: [1, 2],
          permissions: {
            can_manage_maintenance: true,
            can_conduct_inspections: true,
            can_view_tenant_contacts: true,
            can_track_utilities: false,
            can_view_financials: false,
            can_edit_leases: false,
          },
          is_active: true,
          last_login: "2026-06-18 08:30",
          created_at: "2026-01-10",
        },
      ];
    }
  },

  createCaretaker: async (data: CreateCaretakerPayload): Promise<Caretaker> => {
    const response = await apiClient.post(
      "/api/accounts/staff/caretakers/",
      data,
    );
    return response.data;
  },

  updatePermissions: async (
    caretakerId: number,
    permissions: CaretakerPermissions,
  ): Promise<Caretaker> => {
    const response = await apiClient.patch(
      `/api/accounts/staff/caretakers/${caretakerId}/permissions/`,
      { permissions },
    );
    return response.data;
  },

  revokeAccess: async (caretakerId: number): Promise<void> => {
    await apiClient.delete(`/api/accounts/staff/caretakers/${caretakerId}/`);
  },
};
