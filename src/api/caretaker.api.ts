import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface FieldTask {
  id: string;
  type: "maintenance" | "inspection";
  priority: "emergency" | "high" | "medium" | "low";
  title: string;
  description: string;
  property_name: string;
  unit_code: string;
  status: "assigned" | "in_progress" | "pending_review" | "completed";
  reported_by: string;
  created_at: string;
  sla_deadline: string;
}

export interface TaskUpdatePayload {
  status: "in_progress" | "completed";
  notes?: string;
  media_files?: File[]; // For photo evidence
}

// ==========================================
// API METHODS
// ==========================================
export const caretakerApi = {
  // 1. Fetch My Field Tasks (Maintenance + Inspections)
  getMyTasks: async (): Promise<FieldTask[]> => {
    try {
      // In a real app, this hits a specific endpoint filtering by assigned caretaker
      const response = await apiClient.get(
        `${endpoints.MAINTENANCE.REQUESTS}?assigned_to=me`,
      );
      return response.data;
    } catch (error) {
      // Mock Data for UI building
      return [
        {
          id: "M-101",
          type: "maintenance",
          priority: "emergency",
          title: "Severe Water Leak in Bathroom",
          description:
            "Tenant reports water flooding the bathroom floor. Main valve might be failing.",
          property_name: "Myles Apartment",
          unit_code: "A-101",
          status: "assigned",
          reported_by: "John Doe (Tenant)",
          created_at: "10 mins ago",
          sla_deadline: "2 hours",
        },
        {
          id: "M-102",
          type: "maintenance",
          priority: "medium",
          title: "Broken Window Latch",
          description:
            "Window in the living room won't lock properly. Security risk.",
          property_name: "Myles Apartment",
          unit_code: "B-201",
          status: "in_progress",
          reported_by: "Alice Smith",
          created_at: "2 hours ago",
          sla_deadline: "24 hours",
        },
        {
          id: "I-550",
          type: "inspection",
          priority: "low",
          title: "Monthly Fire Safety Check",
          description:
            "Routine check of fire extinguishers and emergency exits for Block A.",
          property_name: "Myles Apartment",
          unit_code: "Common Areas",
          status: "assigned",
          reported_by: "System (Scheduled)",
          created_at: "Today 08:00 AM",
          sla_deadline: "End of Day",
        },
      ];
    }
  },

  // 2. Update Task Status & Upload Evidence
  updateTask: async (
    taskId: string,
    data: TaskUpdatePayload,
  ): Promise<{ success: boolean }> => {
    // Simulating API call with FormData for image uploads
    const formData = new FormData();
    formData.append("status", data.status);
    if (data.notes) formData.append("notes", data.notes);
    if (data.media_files) {
      data.media_files.forEach((file) => formData.append("media", file));
    }

    await apiClient.post(
      `${endpoints.MAINTENANCE.REQUESTS}${taskId}/update/`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return { success: true };
  },
};
