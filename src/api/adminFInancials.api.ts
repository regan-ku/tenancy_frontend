import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface PlatformFinancialKPIs {
  total_platform_volume: number;
  verified_payment_accounts: number;
  pending_account_verifications: number;
  active_disputes: number;
}

// ✅ CRITICAL: Shows the exact financial routing per property
export interface PropertyFinancialRecord {
  id: number;
  property_name: string;
  property_location: string;
  owner_name: string;
  owner_email: string;
  manager_agency_name: string | null; // NULL if self-managed by landlord
  collection_route: "landlord_direct" | "agency_paybill";
  collection_account_number: string; // The actual Paybill/Till/Bank
  total_collected_month: number;
  platform_fee_generated: number;
  status: "compliant" | "account_pending" | "disputed";
}

export interface TransactionLog {
  id: string;
  tenant_name: string;
  property_name: string;
  unit_code: string;
  amount: number;
  routed_to: string; // Name of Owner or Agency
  destination_account: string; // The actual Paybill/Till
  transaction_code: string;
  timestamp: string;
  reconciliation_status: "reconciled" | "pending" | "failed";
}

// ==========================================
// API METHODS
// ==========================================
export const adminFinancialsApi = {
  getPlatformKPIs: async (): Promise<PlatformFinancialKPIs> => {
    return {
      total_platform_volume: 45500000,
      verified_payment_accounts: 142,
      pending_account_verifications: 5,
      active_disputes: 2,
    };
  },

  getPropertyFinancials: async (): Promise<PropertyFinancialRecord[]> => {
    try {
      const response = await apiClient.get("/api/admin/financials/properties/");
      return response.data;
    } catch (error) {
      // ✅ Mock Data demonstrating Owner vs Agency routing
      return [
        {
          id: 1,
          property_name: "Kilimani Heights",
          property_location: "Nairobi",
          owner_name: "David Miller",
          owner_email: "david@email.com",
          manager_agency_name: "Nairobi Premier Realtors", // Agency Managed
          collection_route: "agency_paybill",
          collection_account_number: "Paybill 247247",
          total_collected_month: 2850000,
          platform_fee_generated: 28500,
          status: "compliant",
        },
        {
          id: 2,
          property_name: "Westlands Plaza",
          property_location: "Nairobi",
          owner_name: "Sarah Connor",
          owner_email: "sarah@email.com",
          manager_agency_name: null, // Self-Managed
          collection_route: "landlord_direct",
          collection_account_number: "Till 987654",
          total_collected_month: 900000,
          platform_fee_generated: 9000,
          status: "compliant",
        },
        {
          id: 3,
          property_name: "Lavington Villas",
          property_location: "Nairobi",
          owner_name: "Bruce Wayne",
          owner_email: "bruce@wayne.com",
          manager_agency_name: "Westlands Properties Ltd", // Agency Managed
          collection_route: "agency_paybill",
          collection_account_number: "Paybill 123456",
          total_collected_month: 800000,
          platform_fee_generated: 8000,
          status: "account_pending",
        },
        {
          id: 4,
          property_name: "Karen Office Park",
          property_location: "Nairobi",
          owner_name: "John Doe",
          owner_email: "john@email.com",
          manager_agency_name: null, // Self-Managed
          collection_route: "landlord_direct",
          collection_account_number: "Bank 123456789",
          total_collected_month: 450000,
          platform_fee_generated: 4500,
          status: "disputed",
        },
      ];
    }
  },

  getTransactionLogs: async (): Promise<TransactionLog[]> => {
    return [
      {
        id: "TXN-001",
        tenant_name: "Alice Smith",
        property_name: "Kilimani Heights",
        unit_code: "B-204",
        amount: 15000,
        routed_to: "Nairobi Premier Realtors",
        destination_account: "247247",
        transaction_code: "QFG3H2B9X",
        timestamp: "2026-06-18 09:15",
        reconciliation_status: "reconciled",
      },
      {
        id: "TXN-002",
        tenant_name: "Mike Ross",
        property_name: "Westlands Plaza",
        unit_code: "Shop 1",
        amount: 45000,
        routed_to: "Sarah Connor",
        destination_account: "987654",
        transaction_code: "PJ92K4L1M",
        timestamp: "2026-06-18 10:30",
        reconciliation_status: "reconciled",
      },
      {
        id: "TXN-003",
        tenant_name: "Harvey Specter",
        property_name: "Lavington Villas",
        unit_code: "V-02",
        amount: 35000,
        routed_to: "Westlands Properties Ltd",
        destination_account: "123456",
        transaction_code: "ZX88V3N2Q",
        timestamp: "2026-06-18 11:45",
        reconciliation_status: "pending",
      },
    ];
  },
};
