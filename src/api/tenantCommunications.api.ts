import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type NotificationType =
  | "billing"
  | "maintenance"
  | "application"
  | "tenancy"
  | "system";

export interface TenantNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  related_tenancy_id?: number | null; // Links notification to a specific property/unit
}

export interface NotificationPreferences {
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  in_app_enabled: boolean;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantCommunicationsApi = {
  getNotifications: async (): Promise<TenantNotification[]> => {
    try {
      const response = await apiClient.get(
        "/api/communications/notifications/?user=self",
      );
      return response.data;
    } catch (error) {
      // Mock Data: Demonstrating multi-tenancy tagged notifications
      return [
        {
          id: "N1",
          type: "billing",
          title: "Rent Due Soon",
          message:
            "Your rent of KES 45,000 for Kilimani Heights (B-204) is due in 3 days. Please ensure your M-Pesa line has sufficient funds.",
          is_read: false,
          created_at: "2026-06-28 09:00",
          related_tenancy_id: 101,
        },
        {
          id: "N2",
          type: "maintenance",
          title: "Maintenance Update",
          message:
            "James Mwangi (Caretaker) has marked 'Kitchen sink leaking' as In Progress. They will visit your unit today between 2 PM and 4 PM.",
          is_read: false,
          created_at: "2026-06-27 14:30",
          related_tenancy_id: 101,
        },
        {
          id: "N3",
          type: "tenancy",
          title: "Lease Renewal Reminder",
          message:
            "Your lease for Westlands Commercial Plaza (Shop 12) expires in 60 days. Please contact the agency to discuss renewal terms.",
          is_read: true,
          created_at: "2026-06-25 10:00",
          related_tenancy_id: 102,
        },
        {
          id: "N4",
          type: "system",
          title: "Profile Update",
          message:
            "Your Next of Kin details were successfully updated in the system.",
          is_read: true,
          created_at: "2026-06-20 11:15",
          related_tenancy_id: null,
        },
      ];
    }
  },

  markAsRead: async (id: string) => {
    return apiClient.patch(`/api/communications/notifications/${id}/read/`);
  },

  markAllAsRead: async () => {
    return apiClient.post("/api/communications/notifications/mark-all-read/");
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    return {
      sms_enabled: true,
      whatsapp_enabled: true,
      email_enabled: false,
      in_app_enabled: true,
    };
  },

  updatePreferences: async (prefs: NotificationPreferences) => {
    return apiClient.patch(
      "/api/accounts/profile/notification-preferences/",
      prefs,
    );
  },
};
