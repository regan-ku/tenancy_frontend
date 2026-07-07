import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================

export type ApplicationType =
  | "rental"
  | "transfer"
  | "termination"
  | "extension";

export interface TenancyNote {
  id: number;
  type: "behavior" | "payment" | "maintenance" | "general";
  content: string;
  date: string;
  author: string;
}

export interface FinancialStatus {
  rent_amount: number;
  deposit_amount: number;
  service_charge_amount: number;
  deposit_paid: boolean;
  deposit_waived: boolean;
  service_charge_paid: boolean;
  service_charge_waived: boolean;
  rent_paid: boolean;
  rent_waived: boolean;
  tenancy_status: string;
  tenancy_id?: number;
}

export interface LandlordApplication {
  id: number;
  application_type: ApplicationType;
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
    | "expired"
    | "completed";
  past_tenancy_notes: TenancyNote[];
  submitted_at: string;
  can_approve: boolean;
  agency_can_approve: boolean; // ✅ ADDED: Required by shared ApplicationEditModal
  financial_status: FinancialStatus;

  // Transfer specific fields
  from_unit_code?: string;
  from_property_name?: string;
  to_unit_code?: string;
  to_property_name?: string;
  desired_move_in_date?: string;
  transfer_reason?: string;

  // Termination specific fields
  proposed_move_out_date?: string;
  termination_type?: string;
  penalty_amount?: number;
  termination_notes?: string;

  // Extension specific fields
  new_end_date?: string;
  extension_reason?: string;
}

export interface LandlordTransfer {
  id: number;
  tenant_name: string;
  applicant_phone: string;
  from_property: string;
  from_unit: string;
  to_property: string;
  to_unit: string;
  reason: string;
  desired_move_in_date: string | null;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "escalated"
    | "cancelled"
    | "expired"
    | "completed";
  submitted_at: string;
  financial_status: FinancialStatus;
}

export interface LandlordTermination {
  id: number;
  tenant_name: string;
  applicant_phone: string;
  property_name: string;
  unit_code: string;
  notice_type:
    | "tenant_request"
    | "breach"
    | "expiry"
    | "landlord_request"
    | "mutual";
  proposed_move_out_date: string;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "escalated"
    | "cancelled"
    | "expired"
    | "completed";
  notes: string;
  financial_status: FinancialStatus;
  penalty_amount?: number;
}

export interface LandlordExtension {
  id: number;
  tenant_name: string;
  applicant_phone: string;
  property_name: string;
  unit_code: string;
  new_end_date: string;
  extension_reason: string;
  status:
    | "pending"
    | "under_review"
    | "approved"
    | "rejected"
    | "escalated"
    | "cancelled"
    | "expired"
    | "completed";
  submitted_at: string;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

const normalizeResponse = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (data?.results && Array.isArray(data.results)) return data.results;
  return [];
};

const buildDefaultFinancialStatus = (): FinancialStatus => ({
  rent_amount: 0,
  deposit_amount: 0,
  service_charge_amount: 0,
  deposit_paid: false,
  deposit_waived: false,
  service_charge_paid: false,
  service_charge_waived: false,
  rent_paid: false,
  rent_waived: false,
  tenancy_status: "no_tenancy",
});

const TERMINAL_STATUSES = ["rejected", "cancelled", "expired", "completed"];

// ==========================================
// API METHODS
// ==========================================
export const landlordOperationsApi = {
  // ==========================================
  // RENTAL APPLICATIONS
  // ==========================================
  getApplications: async (): Promise<LandlordApplication[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?application_type=rental`,
      );
      const data = normalizeResponse(response.data);

      const actionableApps = data.filter(
        (app: any) => !TERMINAL_STATUSES.includes(app.status),
      );

      return actionableApps.map((app: any) => ({
        id: app.id,
        application_type: app.application_type || "rental",
        applicant_name: app.applicant_name || "Unknown Applicant",
        applicant_phone: app.applicant_phone || "N/A",
        property_name: app.property_title || "Unknown Property",
        landlord_name: app.reviewer_context?.landlord_name || "Self",
        unit_code: app.unit_code || "N/A",
        status: app.status,
        submitted_at: app.created_at,
        can_approve: app.reviewer_context?.can_approve ?? true,
        agency_can_approve: app.reviewer_context?.can_approve ?? true, // ✅ ADDED
        past_tenancy_notes: app.reviewer_context?.tenant_history_notes || [],
        financial_status: app.financial_status || buildDefaultFinancialStatus(),
      }));
    } catch (error) {
      console.error("Failed to fetch applications", error);
      return [];
    }
  },

  // ==========================================
  // TRANSFER APPLICATIONS
  // ==========================================
  getTransfers: async (): Promise<LandlordTransfer[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?application_type=transfer`,
      );
      const data = normalizeResponse(response.data);

      const actionableTransfers = data.filter(
        (app: any) => !TERMINAL_STATUSES.includes(app.status),
      );

      return actionableTransfers.map((app: any) => ({
        id: app.id,
        tenant_name: app.applicant_name || "Unknown Tenant",
        applicant_phone: app.applicant_phone || "N/A",
        from_property: app.from_property_name || "Unknown",
        from_unit: app.from_unit_code || "N/A",
        to_property: app.to_property_name || "Unknown",
        to_unit: app.to_unit_code || "N/A",
        reason: app.transfer_reason || "",
        desired_move_in_date: app.desired_move_in_date || null,
        status: app.status || "pending",
        submitted_at: app.created_at || new Date().toISOString(),
        financial_status: app.financial_status || buildDefaultFinancialStatus(),
      }));
    } catch (error) {
      console.error("Failed to fetch transfers", error);
      return [];
    }
  },

  // ==========================================
  // TERMINATION APPLICATIONS
  // ==========================================
  getTerminations: async (): Promise<LandlordTermination[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?application_type=termination`,
      );
      const data = normalizeResponse(response.data);

      const actionableTerminations = data.filter(
        (app: any) => !TERMINAL_STATUSES.includes(app.status),
      );

      return actionableTerminations.map((app: any) => ({
        id: app.id,
        tenant_name: app.applicant_name || "Unknown Tenant",
        applicant_phone: app.applicant_phone || "N/A",
        property_name: app.property_name || "Unknown Property",
        unit_code: app.unit_code || "N/A",
        notice_type: app.termination_type || "tenant_request",
        proposed_move_out_date: app.proposed_move_out_date || "",
        status: app.status || "pending",
        notes: app.termination_notes || "",
        financial_status: app.financial_status || buildDefaultFinancialStatus(),
        penalty_amount: app.penalty_amount || 0,
      }));
    } catch (error) {
      console.error("Failed to fetch terminations", error);
      return [];
    }
  },

  // ==========================================
  // EXTENSION APPLICATIONS
  // ==========================================
  getExtensions: async (): Promise<LandlordExtension[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?application_type=extension`,
      );
      const data = normalizeResponse(response.data);

      const actionableExtensions = data.filter(
        (app: any) => !TERMINAL_STATUSES.includes(app.status),
      );

      return actionableExtensions.map((app: any) => ({
        id: app.id,
        tenant_name: app.applicant_name || "Unknown Tenant",
        applicant_phone: app.applicant_phone || "N/A",
        property_name: app.property_name || "Unknown Property",
        unit_code: app.unit_code || "N/A",
        new_end_date: app.new_end_date || "",
        extension_reason: app.extension_reason || "",
        status: app.status || "pending",
        submitted_at: app.created_at || new Date().toISOString(),
      }));
    } catch (error) {
      console.error("Failed to fetch extensions", error);
      return [];
    }
  },

  // ==========================================
  // TENANT-SPECIFIC APPLICATIONS (For Tenant Financials Tab)
  // ==========================================
  getTenantApplications: async (
    tenantId: number,
  ): Promise<LandlordApplication[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?applicant=${tenantId}`,
      );
      const data = normalizeResponse(response.data);

      const filteredApps = data.filter((app: any) =>
        ["transfer", "termination", "extension"].includes(app.application_type),
      );

      return filteredApps.map((app: any) => ({
        id: app.id,
        application_type: app.application_type,
        applicant_name: app.applicant_name || "Unknown",
        applicant_phone: app.applicant_phone || "N/A",
        property_name: app.property_title || "Unknown",
        landlord_name: "Self",
        unit_code: app.unit_code || "N/A",
        status: app.status,
        past_tenancy_notes: [],
        submitted_at: app.created_at,
        can_approve: true,
        agency_can_approve: true, // ✅ ADDED
        financial_status: app.financial_status || buildDefaultFinancialStatus(),
        // Transfer fields
        from_property_name: app.from_property_name,
        from_unit_code: app.from_unit_code,
        to_property_name: app.to_property_name,
        to_unit_code: app.to_unit_code,
        desired_move_in_date: app.desired_move_in_date,
        transfer_reason: app.transfer_reason,
        // Termination fields
        proposed_move_out_date: app.proposed_move_out_date,
        termination_type: app.termination_type,
        penalty_amount: app.penalty_amount || 0,
        termination_notes: app.termination_notes,
        // Extension fields
        new_end_date: app.new_end_date,
        extension_reason: app.extension_reason,
      }));
    } catch (error) {
      console.error("Failed to fetch tenant applications", error);
      return [];
    }
  },

  // ==========================================
  // DECISION & MANAGEMENT ACTIONS
  // ==========================================
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

  managerCancelApplication: async (applicationId: number, reason: string) => {
    return apiClient.post(
      `${endpoints.APPLICATIONS.DETAIL(applicationId)}manager_cancel/`,
      { reason },
    );
  },

  // ==========================================
  // WAIVER MANAGEMENT
  // ==========================================
  applyWaiver: async (
    applicationId: number,
    waiverTypes: ("rent" | "deposit" | "service_charge")[],
    reason: string,
  ) => {
    return apiClient.post(
      `${endpoints.APPLICATIONS.DETAIL(applicationId)}apply_waiver/`,
      {
        waiver_types: waiverTypes,
        reason,
      },
    );
  },

  revokeWaiver: async (
    applicationId: number,
    waiverTypes: ("rent" | "deposit" | "service_charge")[],
    reason: string,
  ) => {
    return apiClient.post(
      `${endpoints.APPLICATIONS.DETAIL(applicationId)}revoke_waiver/`,
      {
        waiver_types: waiverTypes,
        reason,
      },
    );
  },

  // ==========================================
  // APPLICATION EDITING (For role-based updates)
  // ==========================================
  updateApplication: async (
    applicationId: number,
    updateData: Record<string, any>,
  ) => {
    return apiClient.patch(
      `${endpoints.APPLICATIONS.DETAIL(applicationId)}`,
      updateData,
    );
  },
};
