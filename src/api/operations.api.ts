import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface TenancyNote {
  id: number;
  type: "behavior" | "payment" | "maintenance" | "general";
  content: string;
  date: string;
}

export interface RentalApplication {
  id: number;
  type: "rental";
  applicant_name: string;
  applicant_phone: string;
  property_name: string;
  unit_code: string;
  status: "pending" | "under_review" | "approved" | "rejected";
  past_tenancy_notes: TenancyNote[]; // ✅ CRITICAL: Historical notes for review
  submitted_at: string;
}

export interface TransferRequest {
  id: number;
  type: "transfer";
  tenant_name: string;
  from_unit: string;
  to_unit: string;
  reason: string;
  status: "pending" | "approved" | "rejected";
  submitted_at: string;
}

export interface TerminationNotice {
  id: number;
  tenant_name: string;
  unit_code: string;
  notice_type: "tenant_request" | "breach" | "expiry";
  proposed_move_out_date: string;
  status: "pending_review" | "approved" | "rejected";
  notes: string;
}

export interface MaintenanceTicket {
  id: string;
  property_name: string;
  unit_code: string;
  title: string;
  category: string;
  priority: "low" | "medium" | "high" | "emergency";
  status: "open" | "assigned" | "in_progress" | "resolved" | "closed";
  reported_by: string;
  assigned_to?: string;
  created_at: string;
}

// ==========================================
// API METHODS (With Mock Fallbacks)
// ==========================================
export const operationsApi = {
  // 1. Applications (Rental & Transfer)
  getApplications: async (type: "rental" | "transfer"): Promise<any[]> => {
    try {
      const response = await apiClient.get(
        `${endpoints.APPLICATIONS.LIST}?type=${type}`,
      );
      return response.data;
    } catch (error) {
      // Mock Data
      if (type === "rental") {
        return [
          {
            id: 101,
            type: "rental",
            applicant_name: "David Miller",
            applicant_phone: "+254712345678",
            property_name: "Myles Apartment",
            unit_code: "A-102",
            status: "pending",
            submitted_at: "2026-06-15",
            past_tenancy_notes: [
              {
                id: 1,
                type: "payment",
                content: "Paid rent 2 days late in Oct 2025. Waived penalty.",
                date: "2025-10-05",
              },
              {
                id: 2,
                type: "behavior",
                content: "Excellent tenant, no noise complaints.",
                date: "2025-11-12",
              },
            ],
          },
        ];
      }
      return [
        {
          id: 201,
          type: "transfer",
          tenant_name: "Sarah Connor",
          from_unit: "B-201",
          to_unit: "C-101",
          reason: "Need larger space for family",
          status: "pending",
          submitted_at: "2026-06-14",
        },
      ];
    }
  },

  makeDecision: async (
    id: number,
    type: string,
    decision: "approve" | "reject",
    reason: string,
  ) => {
    return apiClient.post(
      `${endpoints.APPLICATIONS.LIST}${id}/make_decision/`,
      { decision, reason },
    );
  },

  // 2. Termination Notices
  getTerminations: async (): Promise<TerminationNotice[]> => {
    try {
      const response = await apiClient.get(
        endpoints.TENANCIES.LIST + "?status=termination_pending",
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: 301,
          tenant_name: "Mike Ross",
          unit_code: "B-202",
          notice_type: "tenant_request",
          proposed_move_out_date: "2026-07-31",
          status: "pending_review",
          notes: "Relocating for work.",
        },
        {
          id: 302,
          tenant_name: "Harvey Specter",
          unit_code: "A-301",
          notice_type: "breach",
          proposed_move_out_date: "2026-06-20",
          status: "pending_review",
          notes: "Unauthorized pets and noise complaints.",
        },
      ];
    }
  },

  // 3. Maintenance Tickets
  getMaintenanceTickets: async (): Promise<MaintenanceTicket[]> => {
    try {
      const response = await apiClient.get(endpoints.MAINTENANCE.REQUESTS);
      return response.data;
    } catch (error) {
      return [
        {
          id: "M-101",
          property_name: "Myles Apartment",
          unit_code: "A-101",
          title: "Water leak in bathroom",
          category: "Plumbing",
          priority: "emergency",
          status: "open",
          reported_by: "John Doe",
          created_at: "2026-06-16",
        },
        {
          id: "M-102",
          property_name: "Myles Apartment",
          unit_code: "B-201",
          title: "Broken window latch",
          category: "Security",
          priority: "medium",
          status: "assigned",
          reported_by: "Alice Smith",
          assigned_to: "Caretaker James",
          created_at: "2026-06-15",
        },
      ];
    }
  },

  assignTicket: async (ticketId: string, caretakerId: number) => {
    return apiClient.post(
      `${endpoints.MAINTENANCE.REQUESTS}${ticketId}/assign/`,
      { caretaker_id: caretakerId },
    );
  },

  updateTicketStatus: async (ticketId: string, status: string) => {
    return apiClient.post(
      `${endpoints.MAINTENANCE.REQUESTS}${ticketId}/update_status/`,
      { status },
    );
  },
};
