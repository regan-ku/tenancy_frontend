import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================

export interface TenancyNote {
  id: number;
  note_type: "general" | "dispute" | "maintenance" | "handover" | "financial";
  content: string;
  is_confidential: boolean;
  created_by_email: string;
  created_at: string;
}

export interface Tenancy {
  id: number;
  tenant: number;
  tenant_email: string;
  unit: number;
  unit_code: string;
  property: number;
  property_title: string;
  tenancy_type: "rental" | "lease";
  status:
    | "pending_payment"
    | "active"
    | "suspended"
    | "extended"
    | "terminated"
    | "transferred"
    | "expired"
    | "scheduled_for_termination";
  start_date: string;
  end_date: string | null;
  rent_amount: number;
  deposit_amount: number;
  service_charge_amount: number;
  deposit_paid: boolean;
  deposit_waived: boolean;
  service_charge_paid: boolean;
  service_charge_waived: boolean;
  available_actions: string[];
  health_status: {
    status: string;
    days_remaining: number | null;
    alerts: Array<{ type: string; message: string }>;
  };
  notes: TenancyNote[];
  pending_requests: {
    transfer?: { id: number; to_unit: string; to_property: string; move_in_date: string | null; reason: string; };
    extension?: { id: number; new_end_date: string; reason: string; };
    termination?: { id: number; effective_date: string; termination_type: string; notes: string; };
  } | null;
  created_at: string;
  updated_at: string;
}

export interface Occupancy {
  unit: number;
  unit_code: string;
  is_occupied: boolean;
  current_tenant: number | null;
  tenant_email: string | null;
  occupancy_start_date: string | null;
  occupancy_end_date: string | null;
  updated_at: string;
}

export interface TenancyWaiver {
  id: number;
  waiver_type: "deposit" | "service_charge" | "both";
  reason: string;
  status: "pending" | "approved" | "rejected";
  requested_by: number;
  approved_by: number | null;
}

export interface TenantHistorySummary {
  total_past_tenancies: number;
  average_stay_duration_months: number;
  payment_reliability_score: string;
  notes: Array<{ note_type: string; content: string; }>;
}

// ✅ Interfaces for Tenant Dashboard & Personal Tenancies
export interface PersonalTenancy {
  id: number;
  property_name: string;
  unit_code: string;
  unit_type: string;
  status: "active" | "pending_payment" | "notice_given" | "expired" | "scheduled_for_termination" | string;
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

export const tenanciesApi = {
  // ==========================================
  // TENANT DASHBOARD & PERSONAL TENANCIES
  // ==========================================
  
  /**
   * Fetches ALL tenancies linked to the logged-in tenant's profile.
   * 
   * 🧠 WHY THIS WORKS: We use the standard TENANCIES.LIST endpoint. 
   * The backend's permission system automatically intercepts this request, 
   * sees you are a Tenant, and filters the database to only return YOUR records.
   */
  getMyPersonalTenancies: async (): Promise<PersonalTenancy[]> => {
    try {
      // ✅ FIXED: Use the master list endpoint instead of a hardcoded 404 URL
      const response = await apiClient.get(endpoints.TENANCIES.LIST);
      const data = response.data;
      
      // Normalize response (handle direct arrays or paginated { results: [] } objects)
      const tenancies = Array.isArray(data) ? data : data?.results || [];
      
      return tenancies.map((t: any) => ({
        id: t.id,
        // Map backend Tenancy fields to frontend PersonalTenancy interface
        property_name: t.property_title || t.property_name || "Unknown Property",
        unit_code: t.unit_code || "N/A",
        unit_type: t.unit_type || t.tenancy_type || "Unit",
        status: t.status,
        rent_amount: t.rent_amount || 0,
        balance_due: t.balance_due || t.outstanding_balance || 0,
        next_billing_date: t.next_billing_date || "",
        landlord_or_agency_name: t.landlord_name || t.manager_name || t.landlord_or_agency_name || "Management",
        lease_end_date: t.end_date || "",
      }));
    } catch (error) {
      console.error("Failed to fetch personal tenancies", error);
      // 🚨 CRITICAL: Return empty array. NEVER fallback to mock data in production.
      return []; 
    }
  },

  /**
   * Fetches high-level KPIs for the tenant dashboard.
   */
  getTenantKPIs: async (tenancies?: PersonalTenancy[]): Promise<TenantKPIs> => {
    try {
      // Attempt to fetch from a dedicated backend KPI endpoint if it exists
      const response = await apiClient.get(`${endpoints.TENANCIES.LIST}kpis/`);
      return response.data;
    } catch (error) {
      console.warn("KPI endpoint not found or failed. Calculating from local tenancies data.");
      
      // 🧠 PRO-TIP: If the backend doesn't have a dedicated KPI endpoint yet, 
      // we calculate it on the frontend using the tenancies array we already fetched!
      if (tenancies && tenancies.length > 0) {
        const activeTenancies = tenancies.filter(t => t.status === "active");
        const totalBalance = activeTenancies.reduce((sum, t) => sum + (t.balance_due || 0), 0);
        
        // Find the earliest next billing date
        const nextDates = activeTenancies
          .map(t => t.next_billing_date)
          .filter(Boolean)
          .sort();
          
        return {
          active_tenancies_count: activeTenancies.length,
          total_outstanding_balance: totalBalance,
          open_maintenance_requests: 0, // Maintenance would need its own API call
          next_billing_date: nextDates[0] || "",
        };
      }

      // Safe defaults if no data is available
      return {
        active_tenancies_count: 0,
        total_outstanding_balance: 0,
        open_maintenance_requests: 0,
        next_billing_date: "",
      };
    }
  },

  // ==========================================
  // TENANCY CRUD & ACTIONS
  // ==========================================

  getTenancies: async (): Promise<Tenancy[]> => {
    const response = await apiClient.get(endpoints.TENANCIES.LIST);
    return response.data.results || response.data;
  },

  getTenancy: async (id: number): Promise<Tenancy> => {
    const response = await apiClient.get(endpoints.TENANCIES.DETAIL(id));
    return response.data;
  },

  activateTenancy: async (
    id: number,
    data: {
      mark_deposit_paid?: boolean;
      mark_service_charge_paid?: boolean;
      request_deposit_waiver?: boolean;
      request_service_charge_waiver?: boolean;
      waiver_reason?: string;
    },
  ): Promise<Tenancy> => {
    const response = await apiClient.post(endpoints.TENANCIES.ACTIVATE(id), data);
    return response.data;
  },

  // ==========================================
  // NOTES (Used by TenantNotesModal)
  // ==========================================

  getTenancyNotes: async (tenancyId: number): Promise<TenancyNote[]> => {
    try {
      const response = await apiClient.get(endpoints.TENANCIES.DETAIL(tenancyId));
      return response.data.notes || [];
    } catch (error) {
      console.error("Failed to fetch tenancy notes:", error);
      return [];
    }
  },

  addTenancyNote: async (
    tenancyId: number,
    data: { note_type: string; content: string; is_confidential?: boolean; },
  ): Promise<TenancyNote> => {
    const response = await apiClient.post(endpoints.TENANCIES.ADD_NOTE(tenancyId), data);
    return response.data;
  },

  // ==========================================
  // CANCEL ACTIONS (Used by TenantsFinancialsTab)
  // ==========================================

  cancelTransfer: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(endpoints.TENANCIES.CANCEL_TRANSFER(tenancyId));
    return response.data;
  },

  cancelTermination: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(endpoints.TENANCIES.CANCEL_TERMINATION(tenancyId));
    return response.data;
  },

  cancelExtension: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(endpoints.TENANCIES.CANCEL_EXTENSION(tenancyId));
    return response.data;
  },

  // ==========================================
  // READ-ONLY DATA (Occupancy, Waivers, History)
  // ==========================================

  getWaivers: async (): Promise<TenancyWaiver[]> => {
    const response = await apiClient.get(endpoints.TENANCIES.WAIVERS);
    return response.data.results || response.data;
  },

  getOccupancy: async (): Promise<Occupancy[]> => {
    const response = await apiClient.get(endpoints.TENANCIES.OCCUPANCY);
    return response.data.results || response.data;
  },

  getTenantHistorySummary: async (tenantId: number): Promise<TenantHistorySummary> => {
    const response = await apiClient.get(endpoints.TENANCIES.TENANT_HISTORY_SUMMARY(tenantId));
    return response.data;
  },
};