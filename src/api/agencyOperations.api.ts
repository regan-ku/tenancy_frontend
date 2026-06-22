import apiClient from "@/api/axios";

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
  status: "pending" | "under_review" | "approved" | "rejected" | "escalated";
  past_tenancy_notes: TenancyNote[];
  submitted_at: string;
  // ✅ DELEGATION CHECK: Can the agency approve this, or must they escalate to the landlord?
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
  getApplications: async (): Promise<AgencyApplication[]> => {
    try {
      const response = await apiClient.get(
        "/api/agencies/1/operations/applications/",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: 101,
          applicant_name: "David Miller",
          applicant_phone: "+254712345678",
          property_name: "Kilimani Heights",
          landlord_name: "Sarah Connor",
          unit_code: "B-204",
          status: "pending",
          submitted_at: "2026-06-18",
          agency_can_approve: true,
          past_tenancy_notes: [
            {
              id: 1,
              type: "payment",
              content:
                "Paid rent 2 days late in Oct 2025. Waived penalty as goodwill.",
              date: "2025-10-05",
              author: "System Admin",
            },
            {
              id: 2,
              type: "behavior",
              content:
                "Excellent tenant, no noise complaints. Kept unit very clean.",
              date: "2025-11-12",
              author: "Caretaker James",
            },
          ],
        },
        {
          id: 102,
          applicant_name: "Alice Smith",
          applicant_phone: "+254700000000",
          property_name: "Lavington Villas",
          landlord_name: "John Doe",
          unit_code: "V-02",
          status: "pending",
          submitted_at: "2026-06-19",
          agency_can_approve: false, // ❌ Partial delegation: Must escalate
          past_tenancy_notes: [
            {
              id: 3,
              type: "maintenance",
              content:
                "Caused minor damage to bathroom fixtures. Deducted from deposit.",
              date: "2024-05-20",
              author: "Landlord John",
            },
          ],
        },
      ];
    }
  },

  getTransfers: async (): Promise<AgencyTransfer[]> => {
    return [
      {
        id: 201,
        tenant_name: "Mike Ross",
        from_property: "Kilimani Heights",
        from_unit: "A-101",
        to_property: "Kilimani Heights",
        to_unit: "C-301",
        reason: "Need larger space for growing family",
        status: "pending",
        submitted_at: "2026-06-15",
      },
    ];
  },

  getTerminations: async (): Promise<AgencyTermination[]> => {
    return [
      {
        id: 301,
        tenant_name: "Harvey Specter",
        property_name: "Westlands Plaza",
        unit_code: "Shop-1",
        notice_type: "tenant_request",
        proposed_move_out_date: "2026-07-31",
        status: "pending_review",
        notes: "Relocating business to another city.",
      },
    ];
  },

  makeDecision: async (
    applicationId: number,
    decision: "approve" | "reject" | "escalate",
    reason: string,
  ) => {
    return apiClient.post(`/api/applications/${applicationId}/make_decision/`, {
      decision,
      reason,
    });
  },
};
