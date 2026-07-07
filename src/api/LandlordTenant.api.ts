import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface NextOfKinInfo {
  name: string;
  phone: string;
  relation: string;
}

export interface TenantDirectoryItem {
  id: number;
  tenant_id: number;
  name: string;
  email: string;
  phone: string;
  unit_code: string;
  property_name: string;
  rent_amount: number;
  status: string;
  days_overdue: number;
  next_of_kin: NextOfKinInfo | null;
}

// ==========================================
// API METHODS
// ==========================================
export const landlordTenantsApi = {
  /**
   * Fetches all active and historical tenancies for the logged-in landlord.
   * The backend handles filtering by the user's owned/delegated properties.
   */
  getTenants: async (): Promise<TenantDirectoryItem[]> => {
    try {
      const response = await apiClient.get(endpoints.TENANCIES.LIST);
      const data = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      return data.map((t: any) => {
        // Safely extract Next of Kin from either the tenant object or root
        const nok = t.tenant?.next_of_kin || t.next_of_kin || null;

        return {
          id: t.id,
          tenant_id: t.tenant?.id || t.tenant_id,
          name: t.tenant?.full_name || t.tenant_name || "Unknown Tenant",
          email: t.tenant?.email || "",
          phone: t.tenant?.phone_number || t.tenant_phone || "",
          unit_code: t.unit?.unit_code || t.unit_code || "N/A",
          property_name:
            t.property?.title || t.property_name || "Unknown Property",
          rent_amount: t.rent_amount || 0,
          status: t.status || "active",
          days_overdue: t.days_overdue || 0,
          next_of_kin: nok
            ? {
                name: nok.full_name || nok.name,
                phone: nok.phone_number || nok.phone,
                relation: nok.relationship || nok.relation,
              }
            : null,
        };
      });
    } catch (error) {
      console.error("Failed to fetch tenants:", error);
      return [];
    }
  },
};
