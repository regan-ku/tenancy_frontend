import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================

// ✅ Landlords can ONLY assign Caretakers
export type LandlordStaffRole = "caretaker";

export interface LandlordStaffMember {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: LandlordStaffRole;
  is_active: boolean;
  date_joined: string;
}

export interface CreateCaretakerPayload {
  full_name: string;
  email: string;
  phone_number: string;
  role: LandlordStaffRole; // Always "caretaker"
}

export interface CreateCaretakerResponse {
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

export interface PropertyAssignment {
  assignment_id: number;
  property_id: number;
  property_name: string;
  operational_role: string;
  assigned_by_agency: string; // Will show Landlord's name or "Self-Managed"
  assigned_at: string;
}

// ==========================================
// API METHODS
// ==========================================
export const landlordStaffApi = {
  // Fetch all caretakers created by this landlord
  getStaff: async (): Promise<LandlordStaffMember[]> => {
    const response = await apiClient.get(
      "/accounts/applicant-management/list-staff/?role=caretaker",
    );
    return response.data;
  },

  // Create a new caretaker account
  createCaretaker: async (
    data: CreateCaretakerPayload,
  ): Promise<CreateCaretakerResponse> => {
    const response = await apiClient.post(
      "/accounts/applicant-management/create-staff/",
      data,
    );
    return response.data;
  },

  // Fetch properties owned by the landlord (available for caretaker assignment)
  getMyProperties: async (): Promise<AccessibleProperty[]> => {
    const response = await apiClient.get("/properties/properties/");
    const data = response.data;

    if (Array.isArray(data)) return data;
    if (data.results) return data.results;
    return [];
  },

  // Assign caretaker to selected properties
  assignCaretakerToProperties: async (
    userId: number,
    propertyIds: number[],
  ): Promise<void> => {
    const promises = propertyIds.map((propertyId) =>
      apiClient.post(`/properties/properties/${propertyId}/staff/assign/`, {
        user_id: userId,
        operational_role: "caretaker",
        notes: "Assigned by Landlord",
      }),
    );
    await Promise.all(promises);
  },

  // Remove caretaker from a specific property
  removeCaretakerFromProperty: async (
    userId: number,
    propertyId: number,
  ): Promise<void> => {
    await apiClient.post(
      `/properties/properties/${propertyId}/staff/${userId}/terminate/`,
    );
  },

  // Deactivate/Revoke the caretaker account entirely
  deactivateCaretaker: async (
    staffId: number,
    reason: string,
  ): Promise<void> => {
    await apiClient.patch(
      `/accounts/applicant-management/${staffId}/deactivate/`,
      { reason: reason },
    );
  },

  // Fetch current property assignments for a specific caretaker
  getCaretakerAssignments: async (
    staffId: number,
  ): Promise<PropertyAssignment[]> => {
    const response = await apiClient.get(
      `/accounts/applicant-management/${staffId}/assignments/`,
    );
    return response.data;
  },
};
