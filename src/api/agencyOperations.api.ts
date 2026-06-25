import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints"; // ✅ Import central registry

// ==========================================
// INTERFACES
// ==========================================
export interface TenancyNote {
  id: number;
  type: "behavior" | "payment" | "maintenance" | "general";
  content: string;
  date: string;
  author: string;
}

export interface AgencyApplication {
  id: number;
  applicant_name: string;
  applicant_phone: string;
  property_name: string;
  landlord_name: string;
  unit_code: string;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "escalated"
    | "cancelled"
    | "expired";
  past_tenancy_notes: TenancyNote[];
  submitted_at: string;
  agency_can_approve: boolean;
}

export interface AgencyTransfer {
  id: number;
  tenant_name: string;
  from_property: string;
  from_unit: string;
  to_property: string;
  to_unit: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export interface AgencyTermination {
  id: number;
  tenant_name: string;
  property_name: string;
  unit_code: string;
  notice_type: "tenant_request" | "breach" | "expiry";
  proposed_move_out_date: string;
  status: "pending_review" | "approved" | "disputed";
  notes: string;
}

// ==========================================
// API METHODS
// ==========================================
export const agencyOperationsApi = {
  /**
   * Fetches applications for the logged-in manager/agency.
   */
  getApplications: async (): Promise<AgencyApplication[]> => {
    try {
      const response = await apiClient.get(endpoints.APPLICATIONS.LIST);
      const data = response.data.results || response.data;

      // ✅ CRITICAL FIX: Explicitly define "terminal" (finished) states.
      // These applications are completely removed from the Operations Queue.
      // This hides: approved, rejected, cancelled (by tenant), and expired applications.
      const terminalStatuses = ["approved", "rejected", "cancelled", "expired"];

      const actionableApps = data.filter(
        (app: any) => !terminalStatuses.includes(app.status),
      );

      return actionableApps.map((app: any) => ({
        id: app.id,
        applicant_name:
          app.reviewer_context?.applicant_name ||
          app.applicant_name ||
          app.applicant_email ||
          "Unknown Applicant",
        applicant_phone:
          app.reviewer_context?.applicant_phone || app.applicant_phone || "N/A",
        property_name: app.property_title || "Unknown Property",
        landlord_name: app.reviewer_context?.landlord_name || "N/A",
        unit_code: app.unit_code || "N/A",
        status: app.status,
        submitted_at: app.created_at,
        agency_can_approve: app.reviewer_context?.can_approve ?? true,
        past_tenancy_notes: app.reviewer_context?.tenant_history_notes || [],
      }));
    } catch (error) {
      console.error("Failed to fetch applications", error);
      return [];
    }
  },

  /**
   * Fetches transfer requests from the Tenancy app.
   */
  getTransfers: async (): Promise<AgencyTransfer[]> => {
    try {
      const response = await apiClient.get(endpoints.TENANCIES.TRANSFERS);
      const data = response.data.results || response.data;

      return data.map((t: any) => ({
        id: t.id,
        tenant_name: t.tenant_name || t.tenant_email || "Unknown Tenant",
        from_property: t.from_property_title || "Unknown",
        from_unit: t.from_unit_code || "N/A",
        to_property: t.to_property_title || "Unknown",
        to_unit: t.to_unit_code || "N/A",
        reason: t.reason || "",
        status: t.transfer_status || t.status || "pending",
        submitted_at: t.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to fetch transfers", error);
      return [];
    }
  },

  /**
   * Fetches termination/move-out notices from the Tenancy app.
   */
  getTerminations: async (): Promise<AgencyTermination[]> => {
    try {
      const response = await apiClient.get(endpoints.TENANCIES.TERMINATIONS);
      const data = response.data.results || response.data;

      return data.map((term: any) => ({
        id: term.id,
        tenant_name: term.tenant_name || term.tenant_email || "Unknown Tenant",
        property_name: term.property_title || "Unknown Property",
        unit_code: term.unit_code || "N/A",
        notice_type: term.termination_type || "tenant_request",
        proposed_move_out_date:
          term.intended_vacate_date || term.proposed_move_out_date || "",
        status: term.status || "pending_review",
        notes: term.notes || "",
      }));
    } catch (error) {
      console.error("Failed to fetch terminations", error);
      return [];
    }
  },

  /**
   * Submits a decision (approve/reject/escalate) for a rental application.
   */
  makeDecision: async (
    applicationId: number,
    decision: "approved" | "rejected" | "escalated",
    reason: string,
  ) => {
    return apiClient.post(endpoints.APPLICATIONS.MAKE_DECISION(applicationId), {
      decision,
      reason,
    });
  },

  /**
   * Submits a decision for a transfer request.
   */
  decideTransfer: async (
    transferId: number,
    decision: "approved" | "rejected",
    reason: string,
  ) => {
    return apiClient.post(
      `${endpoints.TENANCIES.LIST}${transferId}/decide_transfer/`,
      {
        decision,
        reason,
      },
    );
  },

  /**
   * Submits a decision for a termination/move-out notice.
   */
  decideTermination: async (
    terminationId: number,
    decision: "approved" | "rejected",
    reason: string,
  ) => {
    return apiClient.post(
      `${endpoints.TENANCIES.LIST}${terminationId}/decide_termination/`,
      { decision, reason },
    );
  },
};
