import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface PersonalTenancy {
  id: number;
  property_name: string;
  unit_code: string;
  unit_type: string;
  status: "active" | "pending_payment" | "notice_given" | "expired";
  rent_amount: number;
  balance_due: number;
  next_billing_date: string;
  landlord_or_agency_name: string;
  lease_end_date: string;
}

export interface TenantKPIs {
  active_tenancies_count: number;
  total_outstanding_balance: number;
  open_maintenance_requests: number;
  next_billing_date: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantDashboardApi = {
  // Fetches ALL tenancies linked to the logged-in user's profile
  getMyPersonalTenancies: async (): Promise<PersonalTenancy[]> => {
    try {
      const response = await apiClient.get(
        "/api/tenancies/my-personal-tenancies/",
      );
      return response.data;
    } catch (error) {
      // Mock Data: A user who rents a Residential Apartment AND a Commercial Shop
      return [
        {
          id: 101,
          property_name: "Kilimani Heights",
          unit_code: "B-204",
          unit_type: "2 Bedroom Residential",
          status: "active",
          rent_amount: 45000,
          balance_due: 0,
          next_billing_date: "2026-07-01",
          landlord_or_agency_name: "Nairobi Premier Realtors",
          lease_end_date: "2027-06-30",
        },
        {
          id: 102,
          property_name: "Westlands Commercial Plaza",
          unit_code: "Shop 12",
          unit_type: "Commercial Retail",
          status: "active",
          rent_amount: 80000,
          balance_due: 15000,
          next_billing_date: "2026-07-05",
          landlord_or_agency_name: "David Miller (Direct)",
          lease_end_date: "2026-12-31",
        },
      ];
    }
  },

  getTenantKPIs: async (): Promise<TenantKPIs> => {
    return {
      active_tenancies_count: 2,
      total_outstanding_balance: 15000,
      open_maintenance_requests: 1,
      next_billing_date: "2026-07-01",
    };
  },
};
