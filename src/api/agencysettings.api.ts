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
  // 1. Agency Profile (✅ REAL API)
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

  // 2. Payment Accounts (✅ REAL API)
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

  // ✅ NEW: Set a specific account as the default for rent routing
  setDefaultAccount: async (id: number): Promise<void> => {
    await apiClient.patch(endpoints.PAYMENTS.ACCOUNT_DETAIL(id), {
      is_default: true,
    });
  },

  // ✅ NEW: Remove/Delete a payment account
  removePaymentAccount: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.PAYMENTS.ACCOUNT_DETAIL(id));
  },

  // 3. Audit & Activity Log (Mocked until backend endpoint is ready)
  getActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    // TODO: Replace with real API call when backend endpoint is ready
    return [
      {
        id: "L1",
        staff_name: "Sarah Jenkins",
        staff_role: "Property Manager",
        action: "Approved Rental Application",
        target_entity: "David Miller (Kilimani Hts, B-204)",
        timestamp: "2026-06-18 14:32",
        ip_address: "192.168.1.45",
      },
      {
        id: "L2",
        staff_name: "David Ochieng",
        staff_role: "Field Agent",
        action: "Scheduled Property Viewing",
        target_entity: "Lavington Villas, V-02",
        timestamp: "2026-06-18 11:15",
        ip_address: "10.0.0.12",
      },
    ];
  },
};
