import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface AgencyProfile {
  id: number;
  name: string;
  registration_number: string;
  contact_email: string;
  phone_number: string;
  physical_address: string;
  website?: string;
}

// ✅ UPDATED: Handles specific fields for Paybill, Till, and Bank
export interface AgencyPaymentAccount {
  id: number;
  account_type: "paybill" | "till" | "bank";
  account_name: string; // The label (e.g., "Main Rent Collection")
  paybill_number?: string; // For Paybill
  till_number?: string; // For Till
  account_number?: string; // For Paybill (Account No) or Bank (Account No)
  bank_name?: string; // For Bank
  is_default: boolean;
  verification_status: "pending" | "verified" | "rejected";
  created_at: string;
}

// ✅ IMMUTABLE AUDIT LOG INTERFACE
export interface ActivityLogEntry {
  id: string;
  staff_name: string;
  staff_role: string;
  action: string;
  target_entity: string;
  timestamp: string;
  ip_address: string;
}

// ==========================================
// API METHODS
// ==========================================
export const agencySettingsApi = {
  // 1. Agency Profile
  getProfile: async (): Promise<AgencyProfile> => {
    return {
      id: 1,
      name: "Nairobi Premier Realtors",
      registration_number: "PRV-2024-88991",
      contact_email: "admin@nairokipremier.co.ke",
      phone_number: "+254 700 000 000",
      physical_address: "Westlands Business Park, 4th Floor, Nairobi",
      website: "www.nairokipremier.co.ke",
    };
  },

  updateProfile: async (
    data: Partial<AgencyProfile>,
  ): Promise<AgencyProfile> => {
    return data as AgencyProfile;
  },

  // 2. Payment Accounts
  getPaymentAccounts: async (): Promise<AgencyPaymentAccount[]> => {
    return [
      {
        id: 1,
        account_type: "paybill",
        account_name: "Main Rent Collection",
        paybill_number: "247247",
        account_number: "123456789",
        is_default: true,
        verification_status: "verified",
        created_at: "2026-01-15",
      },
      {
        id: 2,
        account_type: "till",
        account_name: "Agency Till Number",
        till_number: "987654",
        is_default: false,
        verification_status: "pending",
        created_at: "2026-06-10",
      },
      {
        id: 3,
        account_type: "bank",
        account_name: "KCB Operating Account",
        bank_name: "KCB Bank",
        account_number: "1234567890",
        is_default: false,
        verification_status: "verified",
        created_at: "2026-02-20",
      },
    ];
  },

  addPaymentAccount: async (
    data: Partial<AgencyPaymentAccount>,
  ): Promise<AgencyPaymentAccount> => {
    return data as AgencyPaymentAccount;
  },

  // 3. Audit & Activity Log (Immutable)
  getActivityLogs: async (): Promise<ActivityLogEntry[]> => {
    return [
      {
        id: "L1",
        staff_name: "Sarah Jenkins",
        staff_role: "Property Manager",
        action: "Approved Rental Application",
        target_entity: "David Miller (Kilimani Hts, B-204)",
        timestamp: "2026-06-18 14:32",
        ip_address: "192.168.1.45",
      },
      {
        id: "L2",
        staff_name: "David Ochieng",
        staff_role: "Field Agent",
        action: "Scheduled Property Viewing",
        target_entity: "Lavington Villas, V-02",
        timestamp: "2026-06-18 11:15",
        ip_address: "10.0.0.12",
      },
      {
        id: "L3",
        staff_name: "System Admin",
        staff_role: "Agency Admin",
        action: "Added Payment Account",
        target_entity: "Till Number 987654",
        timestamp: "2026-06-18 09:00",
        ip_address: "192.168.1.10",
      },
      {
        id: "L4",
        staff_name: "James Mwangi",
        staff_role: "Caretaker",
        action: "Resolved Maintenance Ticket",
        target_entity: "M-101 (Water Leak)",
        timestamp: "2026-06-17 16:45",
        ip_address: "172.16.0.5",
      },
    ];
  },
};
