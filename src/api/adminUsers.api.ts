import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface PlatformUser {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  role: "tenant" | "landlord" | "agency" | "agent" | "caretaker" | "admin";
  status: "active" | "suspended" | "pending_verification";
  date_joined: string;
  last_login: string;
}

export interface VerificationRequest {
  id: string;
  user_type: "landlord" | "agency" | "payment_account";
  applicant_name: string;
  applicant_email: string;
  document_type: string; // e.g., "National ID", "KRA PIN", "Title Deed", "Business Registration"
  document_url?: string; // Simulated URL for the uploaded file
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
  rejection_reason?: string;
}

// ==========================================
// API METHODS
// ==========================================
export const adminUsersApi = {
  // 1. Global User Management
  getAllUsers: async (): Promise<PlatformUser[]> => {
    try {
      const response = await apiClient.get("/api/admin/users/");
      return response.data;
    } catch (error) {
      return [
        {
          id: 1,
          full_name: "John Doe",
          email: "john@email.com",
          phone: "+254711111111",
          role: "landlord",
          status: "active",
          date_joined: "2026-01-10",
          last_login: "2026-06-18",
        },
        {
          id: 2,
          full_name: "Nairobi Premier Realtors",
          email: "admin@nairokipremier.co.ke",
          phone: "+254700000000",
          role: "agency",
          status: "active",
          date_joined: "2026-01-15",
          last_login: "2026-06-19",
        },
        {
          id: 3,
          full_name: "Alice Smith",
          email: "alice@email.com",
          phone: "+254722222222",
          role: "tenant",
          status: "active",
          date_joined: "2026-02-01",
          last_login: "2026-06-19",
        },
        {
          id: 4,
          full_name: "David Ochieng",
          email: "david@email.com",
          phone: "+254733333333",
          role: "agent",
          status: "suspended",
          date_joined: "2026-03-10",
          last_login: "2026-05-01",
        },
        {
          id: 5,
          full_name: "Sarah Connor",
          email: "sarah@email.com",
          phone: "+254744444444",
          role: "landlord",
          status: "pending_verification",
          date_joined: "2026-06-15",
          last_login: "2026-06-15",
        },
      ];
    }
  },

  updateUserStatus: async (userId: number, status: "active" | "suspended") => {
    return apiClient.patch(`/api/admin/users/${userId}/status/`, { status });
  },

  // 2. Verification Engine
  getPendingVerifications: async (): Promise<VerificationRequest[]> => {
    try {
      const response = await apiClient.get("/api/admin/verifications/pending/");
      return response.data;
    } catch (error) {
      return [
        {
          id: "V1",
          user_type: "landlord",
          applicant_name: "Sarah Connor",
          applicant_email: "sarah@email.com",
          document_type: "National ID & KRA PIN",
          submitted_at: "2026-06-15",
          status: "pending",
        },
        {
          id: "V2",
          user_type: "landlord",
          applicant_name: "Bruce Wayne",
          applicant_email: "bruce@wayne.com",
          document_type: "Title Deed (Proof of Ownership)",
          submitted_at: "2026-06-16",
          status: "pending",
        },
        {
          id: "V3",
          user_type: "agency",
          applicant_name: "Westlands Properties Ltd",
          applicant_email: "info@westlands.co.ke",
          document_type: "Certificate of Incorporation",
          submitted_at: "2026-06-17",
          status: "pending",
        },
        {
          id: "V4",
          user_type: "payment_account",
          applicant_name: "Nairobi Premier Realtors",
          applicant_email: "admin@nairokipremier.co.ke",
          document_type: "M-Pesa Paybill 247247 Ownership",
          submitted_at: "2026-06-18",
          status: "pending",
        },
      ];
    }
  },

  approveVerification: async (requestId: string) => {
    return apiClient.post(`/api/admin/verifications/${requestId}/approve/`);
  },

  rejectVerification: async (requestId: string, reason: string) => {
    return apiClient.post(`/api/admin/verifications/${requestId}/reject/`, {
      reason,
    });
  },
};
