import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type ApplicationType = "rental" | "transfer";
export type ApplicationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected";

export interface TenantApplication {
  id: string;
  type: ApplicationType;
  property_name: string;
  unit_code: string;
  target_unit_code?: string; // Only for transfers
  status: ApplicationStatus;
  submitted_at: string;
  reason?: string;
  notes?: string;
}

export interface TenantNotice {
  id: string;
  tenancy_id: number;
  property_name: string;
  unit_code: string;
  notice_type: "tenant_request"; // Tenant initiating move-out
  proposed_move_out_date: string;
  status: "pending_review" | "approved" | "disputed";
  reason: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantOperationsApi = {
  // 1. Fetch all pending/in-progress actions
  getMyApplications: async (): Promise<TenantApplication[]> => {
    try {
      const response = await apiClient.get(
        "/api/applications/my-applications/",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "APP-101",
          type: "rental",
          property_name: "Westlands Plaza",
          unit_code: "Shop 14",
          status: "pending",
          submitted_at: "2026-06-18",
          reason: "Expanding business",
        },
        {
          id: "APP-102",
          type: "transfer",
          property_name: "Kilimani Heights",
          unit_code: "B-204",
          target_unit_code: "C-301",
          status: "under_review",
          submitted_at: "2026-06-15",
          reason: "Need larger space for family",
        },
      ];
    }
  },

  getMyNotices: async (): Promise<TenantNotice[]> => {
    return [
      {
        id: "NOT-001",
        tenancy_id: 102,
        property_name: "Westlands Commercial Plaza",
        unit_code: "Shop 12",
        notice_type: "tenant_request",
        proposed_move_out_date: "2026-09-30",
        status: "pending_review",
        reason: "Relocating business to Mombasa",
      },
    ];
  },

  // 2. Submit Actions
  submitRentalApplication: async (unitId: number, message: string) => {
    return apiClient.post("/api/applications/rental/", {
      unit_id: unitId,
      message,
    });
  },

  submitTransferRequest: async (
    currentTenancyId: number,
    targetUnitId: number,
    reason: string,
  ) => {
    return apiClient.post("/api/applications/transfer/", {
      current_tenancy_id: currentTenancyId,
      target_unit_id: targetUnitId,
      reason,
    });
  },

  submitNoticeToVacate: async (
    tenancyId: number,
    moveOutDate: string,
    reason: string,
  ) => {
    return apiClient.post("/api/tenancies/terminate/", {
      tenancy_id: tenancyId,
      termination_type: "tenant_request",
      proposed_move_out_date: moveOutDate,
      notes: reason,
    });
  },
};
