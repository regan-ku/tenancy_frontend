import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================

// 1. Individual Tenant Profile
export interface PersonalProfile {
  id?: number;
  full_name: string;
  phone_number: string;
  email: string;
  nationality: string;
  id_number: string;
  date_of_birth?: string;
  profile_photo?: string | null;
}

// 2. Agency Tenant Profile (For commercial tenants renting as a business)
export interface AgencyTenantProfile {
  id?: number;
  business_name: string;
  registration_number: string;
  kra_pin: string;
  physical_address: string;
  city: string;
  county: string;
  postal_code: string;
  contact_person_name: string;
  contact_person_phone: string;
  contact_person_email: string;
}

// 3. Next of Kin
export interface NextOfKin {
  id?: number;
  full_name: string;
  relationship: string;
  phone_number: string;
  city: string;
}

// 4. Privacy-Enforced Management Contact
// The backend will strip sensitive landlord data and only return the delegated manager/caretaker
export interface ManagementContact {
  tenancy_id: number;
  property_name: string;
  unit_code: string;
  management_type: "agency" | "caretaker" | "self_managed";
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

// 5. Documents
export interface TenantDocument {
  id: number | string;
  document_type: "lease_agreement" | "receipt" | "id_document" | "move_in_report" | string;
  title: string;
  related_tenancy_id: number | null;
  created_at: string;
  file_url?: string;     // Matches Django backend model
  download_url?: string; // ✅ Added to satisfy DocumentsVault.tsx build error
}

// ==========================================
// API METHODS
// ==========================================
export const tenantProfileApi = {
  // -----------------------------------------
  // 1. PROFILE MANAGEMENT
  // -----------------------------------------
  getPersonalProfile: async (): Promise<PersonalProfile> => {
    const response = await apiClient.get(endpoints.PROFILE.ME);
    const data = response.data;
    return data?.profile || data?.user || data;
  },

  updatePersonalProfile: async (payload: Partial<PersonalProfile>): Promise<PersonalProfile> => {
    const response = await apiClient.patch(endpoints.PROFILE.UPDATE, payload);
    const data = response.data;
    return data?.profile || data?.user || data;
  },

  getAgencyProfile: async (): Promise<AgencyTenantProfile> => {
    const response = await apiClient.get(endpoints.PROFILE.ME);
    const data = response.data;
    return data?.agency_profile || data?.profile || data;
  },

  updateAgencyProfile: async (payload: Partial<AgencyTenantProfile>): Promise<AgencyTenantProfile> => {
    const response = await apiClient.patch(endpoints.PROFILE.UPDATE, payload);
    const data = response.data;
    return data?.agency_profile || data?.profile || data;
  },

  // -----------------------------------------
  // 2. NEXT OF KIN MANAGEMENT
  // -----------------------------------------
  getNextOfKin: async (): Promise<NextOfKin[]> => {
    const response = await apiClient.get(endpoints.PROFILE.NEXT_OF_KIN);
    const data = response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  createNextOfKin: async (payload: Omit<NextOfKin, "id">): Promise<NextOfKin> => {
    const response = await apiClient.post(endpoints.PROFILE.NEXT_OF_KIN, payload);
    return response.data;
  },

  updateNextOfKin: async (id: number, payload: Partial<NextOfKin>): Promise<NextOfKin> => {
    const response = await apiClient.patch(endpoints.PROFILE.NEXT_OF_KIN_DETAIL(id), payload);
    return response.data;
  },

  deleteNextOfKin: async (id: number): Promise<void> => {
    await apiClient.delete(endpoints.PROFILE.NEXT_OF_KIN_DETAIL(id));
  },

  // -----------------------------------------
  // 3. MANAGEMENT CONTACTS (Privacy Enforced)
  // -----------------------------------------
  getManagementContacts: async (): Promise<ManagementContact[]> => {
    // Kept as relative path since it's a custom aggregation endpoint not explicitly 
    // mapped in your master endpoints.ts yet. Axios will correctly append this to your baseURL.
    const response = await apiClient.get("/tenants/me/management-contacts/");
    const data = response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },

  // -----------------------------------------
  // 4. DOCUMENT VAULT
  // -----------------------------------------
  getDocuments: async (): Promise<TenantDocument[]> => {
    const response = await apiClient.get(endpoints.DOCUMENTS.LIST);
    const data = response.data;
    return Array.isArray(data) ? data : data?.results || [];
  },
};