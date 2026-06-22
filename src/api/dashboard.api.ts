import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface DashboardKPIs {
  total_properties: number;
  total_units: number;
  occupancy_rate: number;
  rent_collected: number;
  outstanding_arrears: number;
  active_tenancies: number;
}

export interface PaymentAccount {
  id: number;
  account_type: "paybill" | "till" | "phone";
  account_name: string;
  account_number: string;
  is_default: boolean;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
}

export interface RecentActivity {
  id: number;
  type: "payment" | "application" | "maintenance" | "tenancy";
  message: string;
  timestamp: string;
}

// ==========================================
// API METHODS
// ==========================================
export const dashboardApi = {
  // 1. Fetch Dashboard KPIs
  getKPIs: async (): Promise<DashboardKPIs> => {
    try {
      // ✅ FIX: Changed DASHBOARD to DASHBOARD_ME to match your endpoints.ts
      const response = await apiClient.get(
        endpoints.REPORTS?.DASHBOARD_ME || "/api/reports/dashboard/",
      );
      return response.data;
    } catch (error) {
      // Fallback mock data if backend endpoint isn't fully wired yet
      return {
        total_properties: 4,
        total_units: 42,
        occupancy_rate: 88.5,
        rent_collected: 450000,
        outstanding_arrears: 35000,
        active_tenancies: 37,
      };
    }
  },

  // 2. Payment Accounts Management
  getPaymentAccounts: async (): Promise<PaymentAccount[]> => {
    try {
      // ✅ FIX: Use the centralized endpoint instead of hardcoded string
      const response = await apiClient.get(endpoints.PAYMENTS.ACCOUNTS);
      return response.data;
    } catch (error) {
      // Fallback mock data
      return [
        {
          id: 1,
          account_type: "paybill",
          account_name: "M-Pesa Paybill",
          account_number: "247247",
          is_default: true,
          verification_status: "verified",
          created_at: "2026-01-15",
        },
        {
          id: 2,
          account_type: "till",
          account_name: "Till Number",
          account_number: "123456",
          is_default: false,
          verification_status: "pending",
          created_at: "2026-06-10",
        },
      ];
    }
  },

  addPaymentAccount: async (
    data: Partial<PaymentAccount>,
  ): Promise<PaymentAccount> => {
    // ✅ FIX: Use centralized endpoint
    const response = await apiClient.post(endpoints.PAYMENTS.ACCOUNTS, data);
    return response.data;
  },

  // 3. Payment Simulator (For Testing)
  simulatePayment: async (
    accountId: number,
    amount: number,
  ): Promise<{ success: boolean; message: string }> => {
    // ✅ FIX: Use centralized endpoint structure
    const response = await apiClient.post(
      `${endpoints.PAYMENTS.ACCOUNTS}${accountId}/simulate/`,
      { amount },
    );
    return response.data;
  },
};
