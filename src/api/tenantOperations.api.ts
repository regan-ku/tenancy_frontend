import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES (Data Contracts)
// ==========================================

export type TenantApplicationType = "rental" | "transfer" | "termination" | "extension";

export interface TenantApplication {
  id: number;
  type: TenantApplicationType;
  property_name: string;
  unit_code: string;
  status: "pending" | "under_review" | "approved" | "rejected" | "cancelled" | "expired" | "completed";
  submitted_at: string;
  
  // Transfer specific
  target_unit_code?: string;
  target_property_name?: string;
  transfer_reason?: string;
  desired_move_in_date?: string;

  // Termination specific
  proposed_move_out_date?: string;
  termination_type?: string;
  termination_notes?: string;

  // Extension specific
  new_end_date?: string;
  extension_reason?: string;
}

export interface TenantNotice {
  id: number;
  property_name: string;
  unit_code: string;
  proposed_move_out_date: string;
  status: string;
  notes: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantOperationsApi = {
  /**
   * Fetches all applications submitted by the currently logged-in tenant.
   */
  getMyApplications: async (): Promise<TenantApplication[]> => {
    try {
      const response = await apiClient.get(endpoints.APPLICATIONS.LIST);
      const data = response.data;
      // Handle both direct arrays and paginated { results: [] } responses
      const apps = Array.isArray(data) ? data : data?.results || [];
      
      return apps.map((app: any) => ({
        id: app.id,
        type: app.application_type || "rental",
        property_name: app.property_title || app.property_name || "Unknown Property",
        unit_code: app.unit_code || app.from_unit_code || "N/A",
        status: app.status,
        submitted_at: app.created_at,
        // Transfer fields
        target_unit_code: app.to_unit_code,
        target_property_name: app.to_property_name,
        transfer_reason: app.transfer_reason,
        desired_move_in_date: app.desired_move_in_date,
        // Termination fields
        proposed_move_out_date: app.proposed_move_out_date,
        termination_type: app.termination_type,
        termination_notes: app.termination_notes,
        // Extension fields
        new_end_date: app.new_end_date,
        extension_reason: app.extension_reason,
      }));
    } catch (error) {
      console.error("Failed to fetch my applications", error);
      return [];
    }
  },

  /**
   * Fetches active notices (mapped to termination applications in the backend).
   */
  getMyNotices: async (): Promise<TenantNotice[]> => {
    try {
      const response = await apiClient.get(`${endpoints.APPLICATIONS.LIST}?application_type=termination`);
      const data = response.data;
      const apps = Array.isArray(data) ? data : data?.results || [];
      
      return apps.map((app: any) => ({
        id: app.id,
        property_name: app.property_title || app.property_name || "Unknown Property",
        unit_code: app.unit_code || "N/A",
        proposed_move_out_date: app.proposed_move_out_date || "",
        status: app.status,
        notes: app.termination_notes || "",
      }));
    } catch (error) {
      console.error("Failed to fetch my notices", error);
      return [];
    }
  },

  /**
   * Cancels an active application. 
   * Uses DELETE by standard REST conventions, with a fallback to PATCH if your backend requires a status update.
   */
  cancelApplication: async (applicationId: number, reason: string = "User requested cancellation") => {
    try {
      return await apiClient.delete(endpoints.APPLICATIONS.DETAIL(applicationId));
    } catch (error: any) {
      if (error.response?.status === 405) { // Method Not Allowed (Backend expects PATCH/POST)
         return apiClient.patch(endpoints.APPLICATIONS.DETAIL(applicationId), { status: "cancelled", reason });
      }
      throw error;
    }
  },

  // Modals will use these to submit new requests
  submitRentalApplication: async (payload: any) => apiClient.post(endpoints.APPLICATIONS.RENTAL, payload),
  submitTransferApplication: async (payload: any) => apiClient.post(endpoints.APPLICATIONS.TRANSFER, payload),
};