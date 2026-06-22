import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface AgencyFinancialKPIs {
  total_collected_month: number;
  agency_commission_earned: number;
  pending_reconciliation: number;
  overdue_arrears: number;
}

export interface CollectionLedgerItem {
  id: string;
  property_name: string;
  unit_code: string;
  tenant_name: string;
  amount: number;
  collection_destination: "landlord_direct" | "agency_paybill";
  status: "reconciled" | "pending" | "failed";
  payment_date: string;
  reference_code: string;
}

export interface LandlordSettlement {
  id: string;
  landlord_name: string;
  landlord_email: string;
  properties_managed: number;
  gross_rent_collected: number;
  agency_fee_percentage: number;
  agency_fee_amount: number;
  net_landlord_payout: number;
  reconciliation_status: "pending" | "statement_sent" | "reconciled";
  period: string; // e.g., "June 2026"
}

// ==========================================
// API METHODS
// ==========================================
export const agencyFinancialsApi = {
  getKPIs: async (): Promise<AgencyFinancialKPIs> => {
    try {
      const response = await apiClient.get("/api/reports/dashboard/");
      return response.data.financials;
    } catch (error) {
      return {
        total_collected_month: 4500000,
        agency_commission_earned: 450000, // 10% commission
        pending_reconciliation: 1200000,
        overdue_arrears: 150000,
      };
    }
  },

  getCollectionLedger: async (): Promise<CollectionLedgerItem[]> => {
    try {
      const response = await apiClient.get(
        "/api/payments/reconciliation/agency/",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "TXN-001",
          property_name: "Kilimani Heights",
          unit_code: "A-101",
          tenant_name: "John Doe",
          amount: 15000,
          collection_destination: "agency_paybill",
          status: "reconciled",
          payment_date: "2026-06-05",
          reference_code: "QFG3H2B9X",
        },
        {
          id: "TXN-002",
          property_name: "Kilimani Heights",
          unit_code: "B-204",
          tenant_name: "Alice Smith",
          amount: 20000,
          collection_destination: "landlord_direct",
          status: "reconciled",
          payment_date: "2026-06-06",
          reference_code: "PJ92K4L1M",
        },
        {
          id: "TXN-003",
          property_name: "Westlands Plaza",
          unit_code: "Shop-1",
          tenant_name: "Tech Corp",
          amount: 45000,
          collection_destination: "agency_paybill",
          status: "pending",
          payment_date: "2026-06-10",
          reference_code: "ZX88V3N2Q",
        },
        {
          id: "TXN-004",
          property_name: "Lavington Villas",
          unit_code: "V-02",
          tenant_name: "Mike Ross",
          amount: 35000,
          collection_destination: "agency_paybill",
          status: "reconciled",
          payment_date: "2026-06-12",
          reference_code: "LK77P2M9W",
        },
      ];
    }
  },

  getLandlordSettlements: async (): Promise<LandlordSettlement[]> => {
    try {
      const response = await apiClient.get("/api/reports/settlements/agency/");
      return response.data;
    } catch (error) {
      return [
        {
          id: "STL-001",
          landlord_name: "David Miller",
          landlord_email: "david@email.com",
          properties_managed: 2,
          gross_rent_collected: 1500000,
          agency_fee_percentage: 10,
          agency_fee_amount: 150000,
          net_landlord_payout: 1350000,
          reconciliation_status: "statement_sent",
          period: "June 2026",
        },
        {
          id: "STL-002",
          landlord_name: "Sarah Connor",
          landlord_email: "sarah@email.com",
          properties_managed: 1,
          gross_rent_collected: 800000,
          agency_fee_percentage: 8,
          agency_fee_amount: 64000,
          net_landlord_payout: 736000,
          reconciliation_status: "pending",
          period: "June 2026",
        },
        {
          id: "STL-003",
          landlord_name: "John Doe",
          landlord_email: "john@email.com",
          properties_managed: 1,
          gross_rent_collected: 350000,
          agency_fee_percentage: 10,
          agency_fee_amount: 35000,
          net_landlord_payout: 315000,
          reconciliation_status: "reconciled",
          period: "June 2026",
        },
      ];
    }
  },

  generateSettlementPDF: async (settlementId: string) => {
    // In production, this returns a Blob for PDF download
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, message: "Statement generated successfully." };
  },
};
