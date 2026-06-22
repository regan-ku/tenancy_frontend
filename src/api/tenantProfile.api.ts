import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================

// 1. Individual Tenant Profile
export interface PersonalProfile {
  full_name: string;
  phone_number: string;
  email: string;
  nationality: string;
  id_number: string;
}

// 2. Agency Tenant Profile (Matches your Django AgencyProfile model)
export interface AgencyTenantProfile {
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
  id: number;
  full_name: string;
  relationship: string;
  phone_number: string;
  city: string;
}

// 4. ✅ PRIVACY-ENFORCED MANAGEMENT CONTACT
// Notice: NO landlord_name or landlord_phone exists here.
export interface ManagementContact {
  tenancy_id: number;
  property_name: string;
  unit_code: string;
  management_type: "agency" | "caretaker";
  contact_name: string;
  contact_phone: string;
  contact_email: string;
}

// 5. Documents
export interface TenantDocument {
  id: string;
  document_type:
    | "lease_agreement"
    | "receipt"
    | "id_document"
    | "move_in_report";
  title: string;
  related_tenancy_id: number;
  created_at: string;
  download_url: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantProfileApi = {
  // 1. Profile (Conditional based on user type)
  getPersonalProfile: async (): Promise<PersonalProfile> => {
    return {
      full_name: "Alice Smith",
      phone_number: "+254711222333",
      email: "alice@email.com",
      nationality: "Kenyan",
      id_number: "12345678",
    };
  },

  getAgencyProfile: async (): Promise<AgencyTenantProfile> => {
    return {
      business_name: "TechCorp Solutions Ltd",
      registration_number: "PRV-998877",
      kra_pin: "A1234567890B",
      physical_address: "Westlands Business Park",
      city: "Nairobi",
      county: "Nairobi",
      postal_code: "00100",
      contact_person_name: "John Doe",
      contact_person_phone: "+254700000000",
      contact_person_email: "john@techcorp.com",
    };
  },

  // 2. Next of Kin
  getNextOfKin: async (): Promise<NextOfKin[]> => {
    return [
      {
        id: 1,
        full_name: "Mary Smith",
        relationship: "Sister",
        phone_number: "+254722333444",
        city: "Nairobi",
      },
    ];
  },

  // 3. ✅ PRIVACY-ENFORCED CONTACTS (Backend strips landlord data)
  getManagementContacts: async (): Promise<ManagementContact[]> => {
    return [
      {
        tenancy_id: 101,
        property_name: "Kilimani Heights",
        unit_code: "B-204",
        management_type: "agency",
        contact_name: "Nairobi Premier Realtors",
        contact_phone: "+254700000000",
        contact_email: "admin@nairokipremier.co.ke",
      },
      {
        tenancy_id: 102,
        property_name: "Westlands Commercial Plaza",
        unit_code: "Shop 12",
        management_type: "caretaker",
        contact_name: "James Mwangi (Site Caretaker)",
        contact_phone: "+254722111222",
        contact_email: "james.caretaker@tennacy.com",
      },
    ];
  },

  // 4. Documents
  getDocuments: async (): Promise<TenantDocument[]> => {
    return [
      {
        id: "D1",
        document_type: "lease_agreement",
        title: "Lease Agreement - Kilimani B-204",
        related_tenancy_id: 101,
        created_at: "2026-01-15",
        download_url: "#",
      },
      {
        id: "D2",
        document_type: "receipt",
        title: "Rent Receipt - June 2026",
        related_tenancy_id: 101,
        created_at: "2026-06-05",
        download_url: "#",
      },
      {
        id: "D3",
        document_type: "move_in_report",
        title: "Move-In Inspection Report",
        related_tenancy_id: 102,
        created_at: "2026-03-10",
        download_url: "#",
      },
    ];
  },
};
