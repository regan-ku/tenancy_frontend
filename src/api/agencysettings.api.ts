import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { useAuthStore } from "@/store/auth.store";

// ==========================================
// INTERFACES
// ==========================================
export interface AgencyProfile {
  id: number;
  name: string;
  registration_number: string;
  contact_email: string;
  phone_number: string;
  physical_address: string;
}

export interface AgencyPaymentAccount {
  id: number;
  account_type: "paybill" | "till" | "bank";
  account_name: string;
  paybill_number?: string;
  till_number?: string;
  account_number?: string;
  bank_name?: string;
  is_default: boolean;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
}

export interface ActivityLogEntry {
  id: string;
  staff_name: string;
  staff_role: string;
  action: string;
  target_entity: string;
  timestamp: string;
  ip_address: string;
}

// ==========================================
// API METHODS
// ==========================================
export const agencySettingsApi = {
  // 1. Agency Profile
  getProfile: async (): Promise<AgencyProfile> => {
    try {
      const response = await apiClient.get(endpoints.AGENCIES.LIST);
      const agencies = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      if (agencies.length === 0) {
        return {
          id: 0,
          name: "",
          registration_number: "Not Registered",
          contact_email: "",
          phone_number: "",
          physical_address: "",
        };
      }

      const { user } = useAuthStore.getState();
      const agency =
        agencies.find((a: any) => a.created_by === user?.id) || agencies[0];

      return {
        id: agency.id,
        name: agency.name || "",
        registration_number: agency.registration_number || "",
        contact_email: agency.contact_email || "",
        phone_number: agency.phone_number || "",
        physical_address: agency.physical_address || "",
      };
    } catch (error) {
      console.error("Failed to fetch agency profile:", error);
      throw error;
    }
  },

  updateProfile: async (
    data: Partial<AgencyProfile>,
  ): Promise<AgencyProfile> => {
    try {
      if (!data.id || data.id === 0)
        throw new Error("No agency found to update.");
      const payload = {
        name: data.name,
        contact_email: data.contact_email,
        phone_number: data.phone_number,
        physical_address: data.physical_address,
      };
      const response = await apiClient.patch(
        endpoints.AGENCIES.DETAIL(data.id),
        payload,
      );
      return response.data;
    } catch (error) {
      console.error("Failed to update agency profile:", error);
      throw error;
    }
  },

  // 2. Payment Accounts
  getPaymentAccounts: async (): Promise<AgencyPaymentAccount[]> => {
    try {
      const response = await apiClient.get(endpoints.PAYMENTS.ACCOUNTS);
      const accountsArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      return accountsArray;
    } catch (error) {
      console.error("Failed to fetch payment accounts:", error);
      return [];
    }
  },

  addPaymentAccount: async (data: any): Promise<AgencyPaymentAccount> => {
    const response = await apiClient.post(endpoints.PAYMENTS.ACCOUNTS, data);
    return response.data;
  },

  setDefaultAccount: async (id: number): Promise<void> => {
    await apiClient.patch(endpoints.PAYMENTS.ACCOUNT_DETAIL(id), {
      is_default: true,
    });
  },

  removePaymentAccount: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.PAYMENTS.ACCOUNT_DETAIL(id));
  },

  // ✅ UPDATED: Removed mock data. Now fetches real logs from the backend.
  getActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    try {
      // Calls the real backend endpoint for audit/activity logs
      const response = await apiClient.get("/api/reports/activity-logs/");
      const logsArray = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
      return logsArray;
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      return [];
    }
  },
};
