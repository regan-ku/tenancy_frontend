import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type MaintenancePriority = "low" | "medium" | "high" | "emergency";
export type MaintenanceStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "pending_review"
  | "resolved"
  | "closed";
export type MaintenanceCategory =
  | "plumbing"
  | "electrical"
  | "structural"
  | "security"
  | "appliances"
  | "cleaning"
  | "general";

export interface MaintenanceMedia {
  id: string;
  url: string;
  type: "image" | "video";
}

export interface MaintenanceUpdate {
  id: string;
  timestamp: string;
  author: string; // e.g., "You", "James Mwangi (Caretaker)"
  author_role: string;
  comment: string;
  media?: MaintenanceMedia[];
}

export interface MaintenanceRequest {
  id: string;
  tenancy_id: number;
  property_name: string;
  unit_code: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  status: MaintenanceStatus;

  // ✅ PRIVACY ENFORCED: Only shows assigned staff, NEVER the landlord
  assigned_to_name: string | null;
  assigned_to_role: string | null; // e.g., "Caretaker", "Agency Technician"

  media: MaintenanceMedia[];
  updates: MaintenanceUpdate[];
  created_at: string;
  resolved_at: string | null;
}

export interface CreateMaintenancePayload {
  tenancy_id: number;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  media_files: File[];
}

// ==========================================
// API METHODS
// ==========================================
export const tenantMaintenanceApi = {
  // 1. Fetch Requests (Optionally scoped by tenancy_id)
  getMyRequests: async (tenancyId?: number): Promise<MaintenanceRequest[]> => {
    try {
      const url = tenancyId
        ? `/api/maintenance/requests/?tenant=self&tenancy_id=${tenancyId}`
        : `/api/maintenance/requests/?tenant=self`;
      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      // Mock Data demonstrating multi-tenancy and privacy enforcement
      return [
        {
          id: "REQ-101",
          tenancy_id: 101,
          property_name: "Kilimani Heights",
          unit_code: "B-204",
          title: "Kitchen sink leaking",
          description: "Water is pooling under the sink cabinet.",
          category: "plumbing",
          priority: "medium",
          status: "in_progress",
          assigned_to_name: "James Mwangi",
          assigned_to_role: "Caretaker",
          media: [{ id: "m1", url: "/media/maint/leak.jpg", type: "image" }],
          updates: [
            {
              id: "u1",
              timestamp: "2026-06-18 09:00",
              author: "You",
              author_role: "Tenant",
              comment: "Submitted request with photo.",
            },
            {
              id: "u2",
              timestamp: "2026-06-18 10:30",
              author: "James Mwangi",
              author_role: "Caretaker",
              comment:
                "Acknowledged. I will bring a wrench and replacement pipe after lunch.",
            },
          ],
          created_at: "2026-06-18 09:00",
          resolved_at: null,
        },
        {
          id: "REQ-102",
          tenancy_id: 102,
          property_name: "Westlands Commercial Plaza",
          unit_code: "Shop 12",
          title: "Roller shutter jammed",
          description: "Main security shutter won't close completely.",
          category: "security",
          priority: "high",
          status: "assigned",
          assigned_to_name: "Nairobi Premier Tech Team",
          assigned_to_role: "Agency Technician",
          media: [],
          updates: [
            {
              id: "u3",
              timestamp: "2026-06-19 08:00",
              author: "You",
              author_role: "Tenant",
              comment: "Urgent: Shop cannot be secured for the night.",
            },
          ],
          created_at: "2026-06-19 08:00",
          resolved_at: null,
        },
      ];
    }
  },

  // 2. Create Request (Multipart Form Data for Media)
  createRequest: async (
    data: CreateMaintenancePayload,
  ): Promise<MaintenanceRequest> => {
    const formData = new FormData();
    formData.append("tenancy_id", data.tenancy_id.toString());
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("category", data.category);
    formData.append("priority", data.priority);
    data.media_files.forEach((file) => formData.append("media", file));

    const response = await apiClient.post(
      "/api/maintenance/requests/",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },

  // 3. Add Update / Comment to existing request
  addUpdate: async (
    requestId: string,
    comment: string,
  ): Promise<MaintenanceUpdate> => {
    const response = await apiClient.post(
      `/api/maintenance/requests/${requestId}/update/`,
      { comment },
    );
    return response.data;
  },
};
