import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

export interface TenantHistorySummary {
  total_past_tenancies: number;
  active_tenancies: number;
  average_stay_duration_months: number;
  payment_reliability_score: string; // e.g., "Excellent", "Good", "Poor"
  notes: Array<{
    date: string;
    note_type: string; // e.g., "behavior", "payment", "maintenance"
    content: string;
    created_by_role: string;
  }>;
}

export const applicationsApi = {
  /**
   * Submits a new application (Rental or Transfer).
   * Uses FormData to support file uploads (documents) and complex nested data.
   */
  submitApplication: async (formData: FormData) => {
    const response = await apiClient.post(
      endpoints.APPLICATIONS.LIST,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Fetches the current user's tenancy history and behavioral notes.
   * This is displayed to the user during the final review step so they know
   * exactly what the manager/agent will see.
   */
  getTenantHistorySummary: async (
    tenantId: number,
  ): Promise<TenantHistorySummary> => {
    const response = await apiClient.get(
      endpoints.TENANCIES.TENANT_HISTORY(tenantId),
    );
    return response.data;
  },
};
