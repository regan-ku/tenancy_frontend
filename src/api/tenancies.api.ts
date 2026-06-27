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
    | "scheduled_for_termination"; // ✅ Added new status
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
  // ✅ This is populated by the backend's unified Application parser
  pending_requests: {
    transfer?: {
      id: number;
      to_unit: string;
      to_property: string;
      move_in_date: string | null;
      reason: string;
    };
    extension?: {
      id: number;
      new_end_date: string;
      reason: string;
    };
    termination?: {
      id: number;
      effective_date: string;
      termination_type: string;
      notes: string;
    };
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
  notes: Array<{
    note_type: string;
    content: string;
  }>;
}

// ==========================================
// API METHODS
// ==========================================

export const tenanciesApi = {
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
    const response = await apiClient.post(
      endpoints.TENANCIES.ACTIVATE(id),
      data,
    );
    return response.data;
  },

  // ==========================================
  // NOTES (Used by TenantNotesModal)
  // ==========================================

  getTenancyNotes: async (tenancyId: number): Promise<TenancyNote[]> => {
    try {
      const response = await apiClient.get(
        endpoints.TENANCIES.DETAIL(tenancyId),
      );
      return response.data.notes || [];
    } catch (error) {
      console.error("Failed to fetch tenancy notes:", error);
      return [];
    }
  },

  addTenancyNote: async (
    tenancyId: number,
    data: {
      note_type: string;
      content: string;
      is_confidential?: boolean;
    },
  ): Promise<TenancyNote> => {
    const response = await apiClient.post(
      endpoints.TENANCIES.ADD_NOTE(tenancyId),
      data,
    );
    return response.data;
  },

  // ==========================================
  // CANCEL ACTIONS (Used by TenantsFinancialsTab)
  // ==========================================
  // ✅ NOTE: These hit the TenancyViewSet, but we updated the BACKEND
  // to look for and cancel the unified Application records!

  cancelTransfer: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(
      endpoints.TENANCIES.CANCEL_TRANSFER(tenancyId),
    );
    return response.data;
  },

  cancelTermination: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(
      endpoints.TENANCIES.CANCEL_TERMINATION(tenancyId),
    );
    return response.data;
  },

  cancelExtension: async (tenancyId: number): Promise<{ detail: string }> => {
    const response = await apiClient.post(
      endpoints.TENANCIES.CANCEL_EXTENSION(tenancyId),
    );
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

  getTenantHistorySummary: async (
    tenantId: number,
  ): Promise<TenantHistorySummary> => {
    const response = await apiClient.get(
      endpoints.TENANCIES.TENANT_HISTORY_SUMMARY(tenantId),
    );
    return response.data;
  },
};
