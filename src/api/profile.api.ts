import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

export interface ProfileUpdateData {
  full_name?: string;
  phone_number?: string;
}

export const profileApi = {
  getProfile: async () => {
    const response = await apiClient.get(endpoints.PROFILE.ME);
    return response.data;
  },

  updateProfile: async (data: ProfileUpdateData) => {
    const response = await apiClient.patch(endpoints.PROFILE.UPDATE, data);
    return response.data;
  },

  /**
   * ✅ Submits the complete onboarding wizard data, including file uploads.
   * Hits the POST /api/v1/accounts/profile/complete/ endpoint.
   */
  completeOnboarding: async (formData: FormData) => {
    const endpoint = endpoints.PROFILE.ONBOARDING_SUBMIT;

    const response = await apiClient.post(endpoint, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getVerificationStatus: async () => {
    const response = await apiClient.get(endpoints.PROFILE.VERIFICATION_STATUS);
    return response.data;
  },
};
