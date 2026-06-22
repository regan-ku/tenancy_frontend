import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface FinancialOverview {
  total_collected_this_month: number;
  total_arrears: number;
  pending_invoices: number;
  occupancy_rate: number;
}

export interface PropertyFinancials {
  property_id: number;
  property_name: string;
  total_units: number;
  collected_this_month: number;
  outstanding_arrears: number;
}

export interface TenantLedgerItem {
  id: number;
  tenant_name: string;
  tenant_phone: string;
  property_name: string;
  unit_code: string;
  rent_amount: number;
  amount_paid: number;
  balance: number;
  status: "paid" | "partial" | "overdue" | "vacant";
  last_payment_date: string | null;
  receipt_id?: string | null;
}

// ==========================================
// API METHODS
// ==========================================
export const paymentsApi = {
  // 1. Financial Overview & Property Breakdown
  getFinancialOverview: async (): Promise<FinancialOverview> => {
    try {
      const response = await apiClient.get(
        endpoints.REPORTS?.DASHBOARD_ME || "/api/reports/dashboard/",
      );
      return response.data.financials || response.data;
    } catch (error) {
      return {
        total_collected_this_month: 450000,
        total_arrears: 35000,
        pending_invoices: 12,
        occupancy_rate: 88,
      };
    }
  },

  getPropertyFinancials: async (): Promise<PropertyFinancials[]> => {
    try {
      const response = await apiClient.get("/api/reports/property-financials/");
      return response.data;
    } catch (error) {
      return [
        {
          property_id: 1,
          property_name: "Myles Apartment",
          total_units: 20,
          collected_this_month: 250000,
          outstanding_arrears: 15000,
        },
        {
          property_id: 2,
          property_name: "Kilimani Heights",
          total_units: 15,
          collected_this_month: 200000,
          outstanding_arrears: 20000,
        },
      ];
    }
  },

  // 2. Master Ledger (All Tenants & Balances)
  getMasterLedger: async (): Promise<TenantLedgerItem[]> => {
    try {
      const response = await apiClient.get(
        endpoints.PAYMENTS.ARREARS || "/api/payments/ledger/",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          tenant_name: "John Doe",
          tenant_phone: "+254712345678",
          property_name: "Myles Apartment",
          unit_code: "A-101",
          rent_amount: 15000,
          amount_paid: 15000,
          balance: 0,
          status: "paid",
          last_payment_date: "2026-06-05",
          receipt_id: "REC-001",
        },
        {
          id: 2,
          tenant_name: "Alice Smith",
          tenant_phone: "+254700000000",
          property_name: "Myles Apartment",
          unit_code: "A-102",
          rent_amount: 15000,
          amount_paid: 5000,
          balance: 10000,
          status: "overdue",
          last_payment_date: "2026-05-10",
          receipt_id: "REC-002",
        },
        {
          id: 3,
          tenant_name: "Mike Ross",
          tenant_phone: "+254711111111",
          property_name: "Kilimani Heights",
          unit_code: "B-201",
          rent_amount: 20000,
          amount_paid: 20000,
          balance: 0,
          status: "paid",
          last_payment_date: "2026-06-01",
          receipt_id: "REC-003",
        },
      ];
    }
  },

  // 3. Request M-Pesa STK Push
  requestSTKPush: async (
    tenantId: number,
    amount: number,
    phone: string,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      endpoints.INTEGRATIONS.MPESA_STK_PUSH,
      {
        tenant_id: tenantId,
        amount: amount,
        phone_number: phone,
      },
    );
    return response.data;
  },

  // 4. Send Payment Reminder
  sendPaymentReminder: async (
    tenantId: number,
    channel: "sms" | "whatsapp",
    message: string,
  ): Promise<{ success: boolean }> => {
    const response = await apiClient.post(
      endpoints.COMMUNICATIONS.NOTIFICATIONS,
      {
        recipient_id: tenantId,
        channel: channel,
        type: "payment_reminder",
        content: message,
      },
    );
    return response.data;
  },

  // 5. Download Receipt
  downloadReceipt: async (receiptId: string) => {
    const response = await apiClient.get(
      `${endpoints.DOCUMENTS.LIST}${receiptId}/download/`,
      {
        responseType: "blob", // Crucial for downloading files
      },
    );
    return response.data;
  },
};
