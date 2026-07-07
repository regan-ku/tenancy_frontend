import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints"; // ✅ IMPORT ENDPOINTS

// ==========================================
// INTERFACES
// ==========================================
export interface LandlordProfile {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
  role: string;
  is_verified: boolean;
}

export interface NextOfKin {
  id?: number;
  full_name: string;
  relationship: string;
  phone_number: string;
  city: string;
}

export interface LandlordPaymentAccount {
  id: number;
  account_type: "paybill" | "till" | "bank";
  account_name: string;
  paybill_number?: string;
  till_number?: string;
  account_number?: string;
  bank_name?: string;
  is_default: boolean;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
}

export interface VerificationDocument {
  id: number;
  document_type: string;
  status: "pending" | "verified" | "rejected" | "missing";
  file_url?: string;
}

// ==========================================
// API METHODS
// ==========================================
export const landlordSettingsApi = {
  // 1. PROFILE
  getProfile: async (): Promise<LandlordProfile> => {
    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.get(endpoints.PROFILE.ME);
    return response.data;
  },

  updateProfile: async (
    data: Partial<LandlordProfile>,
  ): Promise<LandlordProfile> => {
    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.patch(endpoints.PROFILE.UPDATE, data);
    return response.data;
  },

  // 2. NEXT OF KIN
  getNextOfKin: async (): Promise<NextOfKin | null> => {
    try {
      // ✅ FIXED: Uses correct endpoint
      const response = await apiClient.get(endpoints.PROFILE.NEXT_OF_KIN);

      // Handle both direct object and array responses
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return data.length > 0
        ? data[0]
        : response.data.id
          ? response.data
          : null;
    } catch {
      return null;
    }
  },

  saveNextOfKin: async (data: NextOfKin): Promise<NextOfKin> => {
    if (data.id) {
      // ✅ FIXED: Uses correct endpoint
      const response = await apiClient.patch(
        endpoints.PROFILE.NEXT_OF_KIN_DETAIL(data.id),
        data,
      );
      return response.data;
    } else {
      // ✅ FIXED: Uses correct endpoint
      const response = await apiClient.post(
        endpoints.PROFILE.NEXT_OF_KIN,
        data,
      );
      return response.data;
    }
  },

  // 3. PAYMENT ACCOUNTS
  getPaymentAccounts: async (): Promise<LandlordPaymentAccount[]> => {
    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.get(endpoints.PAYMENTS.ACCOUNTS);
    return Array.isArray(response.data)
      ? response.data
      : response.data.results || [];
  },

  addPaymentAccount: async (data: any): Promise<LandlordPaymentAccount> => {
    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.post(endpoints.PAYMENTS.ACCOUNTS, data);
    return response.data;
  },

  setDefaultAccount: async (id: number): Promise<void> => {
    // ✅ FIXED: Uses correct endpoint
    await apiClient.patch(endpoints.PAYMENTS.ACCOUNT_DETAIL(id), {
      is_default: true,
    });
  },

  removePaymentAccount: async (id: number): Promise<void> => {
    // ✅ FIXED: Uses correct endpoint
    await apiClient.delete(endpoints.PAYMENTS.ACCOUNT_DETAIL(id));
  },

  simulatePayment: async (
    accountId: number,
    amount: number,
    phoneNumber: string,
  ): Promise<{ message: string }> => {
    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.post(
      endpoints.INTEGRATIONS.MPESA_STK_PUSH,
      {
        account_id: accountId,
        amount,
        phone_number: phoneNumber,
      },
    );
    return response.data;
  },

  // 4. VERIFICATION DOCUMENTS
  getVerificationStatus: async (): Promise<VerificationDocument[]> => {
    try {
      // ✅ FIXED: Uses correct endpoint
      const response = await apiClient.get(
        endpoints.PROFILE.VERIFICATION_STATUS,
      );
      return Array.isArray(response.data)
        ? response.data
        : response.data.results || [];
    } catch {
      return [];
    }
  },

  uploadDocument: async (
    file: File,
    documentType: string,
  ): Promise<VerificationDocument> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("document_type", documentType);

    // ✅ FIXED: Uses correct endpoint
    const response = await apiClient.post(
      endpoints.PROFILE.VERIFICATION_SUBMIT,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return response.data;
  },
};
