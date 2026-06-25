import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

export interface TenantHistorySummary {
  total_past_tenancies: number;
  active_tenancies: number;
  average_stay_duration_months: number;
  payment_reliability_score: string;
  notes: Array<{
    date: string;
    note_type: string;
    content: string;
    created_by_role: string;
  }>;
}

export const applicationsApi = {
  /**
   * Submits a new application (Rental or Transfer).
   */
  submitApplication: async (formData: FormData) => {
    const response = await apiClient.post(
      endpoints.APPLICATIONS.LIST,
      formData,
    );
    return response.data;
  },

  /**
   * Fetches the current user's tenancy history and behavioral notes.
   */
  getTenantHistorySummary: async (
    tenantId: number,
  ): Promise<TenantHistorySummary> => {
    const response = await apiClient.get(
      endpoints.TENANCIES.TENANT_HISTORY(tenantId),
    );
    return response.data;
  },

  /**
   * ✅ NEW: Cancels a submitted application (only allowed if status is pending/under_review).
   * We construct the URL dynamically since we haven't added CANCEL to endpoints.ts yet.
   */
  cancelApplication: async (applicationId: number): Promise<void> => {
    const response = await apiClient.post(
      `${endpoints.APPLICATIONS.DETAIL(applicationId)}cancel/`,
    );
    return response.data;
  },
};
