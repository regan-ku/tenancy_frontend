import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type AgencyRole = "property_manager" | "agent" | "caretaker";

export interface AgencyStaffPermissions {
  // Property Manager (Virtual Landlord)
  can_manage_tenancies: boolean;
  can_approve_applications: boolean;
  can_view_financials: boolean;

  // Agent (Customer Facing)
  can_manage_viewings: boolean;
  can_handle_leads: boolean;

  // Caretaker (Field Ops)
  can_manage_maintenance: boolean;
  can_conduct_inspections: boolean;
}

export interface AgencyStaffMember {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: AgencyRole;
  permissions: AgencyStaffPermissions;
  assigned_properties: { id: number; name: string }[];
  active_tasks: number;
  is_active: boolean;
  created_at: string;
}

export interface CreateStaffPayload {
  full_name: string;
  email: string;
  phone: string;
  role: AgencyRole;
}

// ==========================================
// API METHODS
// ==========================================
export const agencyStaffApi = {
  getStaff: async (): Promise<AgencyStaffMember[]> => {
    try {
      const response = await apiClient.get("/api/agencies/1/staff/");
      return response.data;
    } catch (error) {
      // Mock Data demonstrating the Role Hierarchy
      return [
        {
          id: 1,
          full_name: "Sarah Jenkins",
          email: "sarah@agency.com",
          phone: "+254722000111",
          role: "property_manager",
          permissions: {
            can_manage_tenancies: true,
            can_approve_applications: true,
            can_view_financials: true,
            can_manage_viewings: true,
            can_handle_leads: true,
            can_manage_maintenance: true,
            can_conduct_inspections: true,
          },
          assigned_properties: [
            { id: 2, name: "Kilimani Heights" },
            { id: 3, name: "Lavington Villas" },
          ],
          active_tasks: 14,
          is_active: true,
          created_at: "2026-01-10",
        },
        {
          id: 2,
          full_name: "David Ochieng",
          email: "david@agency.com",
          phone: "+254711222333",
          role: "agent",
          permissions: {
            can_manage_tenancies: false,
            can_approve_applications: false,
            can_view_financials: false,
            can_manage_viewings: true,
            can_handle_leads: true,
            can_manage_maintenance: false,
            can_conduct_inspections: false,
          },
          assigned_properties: [{ id: 2, name: "Kilimani Heights" }],
          active_tasks: 8,
          is_active: true,
          created_at: "2026-02-15",
        },
        {
          id: 3,
          full_name: "James Mwangi",
          email: "james@agency.com",
          phone: "+254700999888",
          role: "caretaker",
          permissions: {
            can_manage_tenancies: false,
            can_approve_applications: false,
            can_view_financials: false,
            can_manage_viewings: false,
            can_handle_leads: false,
            can_manage_maintenance: true,
            can_conduct_inspections: true,
          },
          assigned_properties: [
            { id: 2, name: "Kilimani Heights" },
            { id: 4, name: "Westlands Plaza" },
          ],
          active_tasks: 5,
          is_active: true,
          created_at: "2026-03-01",
        },
      ];
    }
  },

  createStaff: async (data: CreateStaffPayload): Promise<AgencyStaffMember> => {
    const response = await apiClient.post("/api/agencies/1/staff/", data);
    return response.data;
  },

  assignToProperty: async (staffId: number, propertyIds: number[]) => {
    return apiClient.post(`/api/agencies/staff/${staffId}/assign-properties/`, {
      property_ids: propertyIds,
    });
  },

  deactivateStaff: async (staffId: number) => {
    return apiClient.patch(`/api/agencies/staff/${staffId}/`, {
      is_active: false,
    });
  },
};
