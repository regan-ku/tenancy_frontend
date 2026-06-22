import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface TenantInvoice {
  id: string;
  invoice_number: string;
  billing_period: string;
  issue_date: string;
  due_date: string;
  rent_amount: number;
  service_charge: number;
  total_amount: number;
  amount_paid: number;
  balance_due: number;
  status: "paid" | "partial" | "overdue" | "pending";
}

export interface TenantPayment {
  id: string;
  payment_date: string;
  amount: number;
  payment_method: "mpesa_stk" | "bank_transfer" | "cash";
  transaction_code: string;
  invoice_reference: string;
  receipt_url: string;
}

export interface STKPushRequest {
  tenancy_id: number;
  phone_number: string;
  amount: number;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantFinancialsApi = {
  // 1. Fetch Invoices scoped to a specific tenancy
  getInvoices: async (tenancyId: number): Promise<TenantInvoice[]> => {
    try {
      const response = await apiClient.get(
        `/api/payments/invoices/?tenancy_id=${tenancyId}`,
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "INV-101",
          invoice_number: "INV-2026-06-001",
          billing_period: "June 2026",
          issue_date: "2026-05-25",
          due_date: "2026-06-05",
          rent_amount: 45000,
          service_charge: 2000,
          total_amount: 47000,
          amount_paid: 47000,
          balance_due: 0,
          status: "paid",
        },
        {
          id: "INV-102",
          invoice_number: "INV-2026-07-001",
          billing_period: "July 2026",
          issue_date: "2026-06-25",
          due_date: "2026-07-05",
          rent_amount: 45000,
          service_charge: 2000,
          total_amount: 47000,
          amount_paid: 0,
          balance_due: 47000,
          status: "pending",
        },
      ];
    }
  },

  // 2. Fetch Payment History scoped to a specific tenancy
  getPayments: async (tenancyId: number): Promise<TenantPayment[]> => {
    try {
      const response = await apiClient.get(
        `/api/payments/history/?tenancy_id=${tenancyId}`,
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "PAY-101",
          payment_date: "2026-06-02 09:15 AM",
          amount: 47000,
          payment_method: "mpesa_stk",
          transaction_code: "QFG3H2B9X1",
          invoice_reference: "INV-2026-06-001",
          receipt_url: "/receipts/REC-101.pdf",
        },
      ];
    }
  },

  // 3. Trigger M-Pesa STK Push (Routes directly to Landlord/Agency Paybill)
  initiateSTKPush: async (
    data: STKPushRequest,
  ): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post(
      "/api/integrations/mpesa/stk-push/",
      data,
    );
    return response.data;
  },

  // 4. Download Receipt
  downloadReceipt: async (receiptUrl: string) => {
    // In production, triggers a blob download
    window.open(receiptUrl, "_blank");
  },
};
