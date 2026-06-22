import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type MaintenancePriority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "resolved"
  | "closed";

export interface AgencyMaintenanceRequest {
  id: string;
  // Property Context (Delegated)
  property_name: string;
  unit_code: string;
  landlord_name: string; // Crucial: Agency needs to know who owns the asset

  // Issue Details
  tenant_name: string;
  title: string;
  description: string;
  category: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;

  // Assignment & SLA
  assigned_staff_id: number | null;
  assigned_staff_name: string | null;
  created_at: string;
  sla_deadline: string;
}

export interface AgencyStaffOption {
  id: number;
  full_name: string;
  role: string; // e.g., "Caretaker", "Plumber", "Electrician"
}

// ==========================================
// API METHODS
// ==========================================
export const agencyMaintenanceApi = {
  // 1. Fetch all requests for delegated properties
  getDelegatedRequests: async (): Promise<AgencyMaintenanceRequest[]> => {
    try {
      const response = await apiClient.get(
        "/api/agencies/1/maintenance/requests/",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "REQ-101",
          property_name: "Kilimani Heights",
          unit_code: "B-204",
          landlord_name: "David Miller",
          tenant_name: "Alice Smith",
          title: "Kitchen sink leaking",
          description: "Water pooling under the cabinet.",
          category: "Plumbing",
          priority: "high",
          status: "open",
          assigned_staff_id: null,
          assigned_staff_name: null,
          created_at: "2026-06-20 09:00",
          sla_deadline: "2026-06-20 17:00",
        },
        {
          id: "REQ-102",
          property_name: "Westlands Plaza",
          unit_code: "Shop 12",
          landlord_name: "Sarah Connor",
          tenant_name: "Tech Corp",
          title: "Roller shutter jammed",
          description: "Security shutter won't close.",
          category: "Security",
          priority: "emergency",
          status: "assigned",
          assigned_staff_id: 3,
          assigned_staff_name: "James Mwangi",
          created_at: "2026-06-20 08:00",
          sla_deadline: "2026-06-20 10:00",
        },
        {
          id: "REQ-103",
          property_name: "Lavington Villas",
          unit_code: "V-02",
          landlord_name: "Bruce Wayne",
          tenant_name: "Mike Ross",
          title: "Broken window latch",
          description: "Living room window won't lock.",
          category: "Structural",
          priority: "medium",
          status: "in_progress",
          assigned_staff_id: 3,
          assigned_staff_name: "James Mwangi",
          created_at: "2026-06-19 14:00",
          sla_deadline: "2026-06-21 14:00",
        },
      ];
    }
  },

  // 2. Fetch internal staff available for assignment
  getAssignableStaff: async (): Promise<AgencyStaffOption[]> => {
    return [
      { id: 1, full_name: "James Mwangi", role: "Senior Caretaker" },
      { id: 2, full_name: "Peter Kamau", role: "Plumbing Specialist" },
      { id: 3, full_name: "Sarah Ochieng", role: "Electrician" },
    ];
  },

  // 3. Assign staff to a request
  assignStaff: async (requestId: string, staffId: number, notes?: string) => {
    return apiClient.post(`/api/maintenance/requests/${requestId}/assign/`, {
      staff_id: staffId,
      notes,
    });
  },

  // 4. Update status
  updateStatus: async (requestId: string, status: MaintenanceStatus) => {
    return apiClient.patch(`/api/maintenance/requests/${requestId}/`, {
      status,
    });
  },
};
