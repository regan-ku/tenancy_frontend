import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface SystemHealthMetrics {
  status: "healthy" | "degraded" | "down";
  cpu_usage: number; // percentage
  memory_usage: number; // percentage
  db_status: "connected" | "disconnected";
  redis_status: "connected" | "disconnected";
  celery_workers: number;
  active_users: number;
}

export interface IntegrationStatus {
  id: string;
  provider:
    | "mpesa"
    | "africastalking_sms"
    | "whatsapp_business"
    | "google_maps";
  service_name: string;
  status: "active" | "degraded" | "offline" | "maintenance";
  api_key_masked: string;
  account_balance?: number; // For SMS/WhatsApp credits
  last_health_check: string;
  error_rate_24h: number; // percentage
}

export interface PlatformConfig {
  id: string;
  key: string;
  label: string;
  description: string;
  is_enabled: boolean;
  category: "security" | "marketplace" | "billing" | "notifications";
}

export interface AdminAccount {
  id: number;
  full_name: string;
  email: string;
  role: "super_admin" | "support_admin" | "finance_admin";
  is_active: boolean;
  two_factor_enabled: boolean;
  last_login: string;
}

// ==========================================
// API METHODS
// ==========================================
export const adminPlatformApi = {
  // 1. System Health
  getSystemHealth: async (): Promise<SystemHealthMetrics> => {
    return {
      status: "healthy",
      cpu_usage: 34,
      memory_usage: 58,
      db_status: "connected",
      redis_status: "connected",
      celery_workers: 4,
      active_users: 1420,
    };
  },

  // 2. Integrations
  getIntegrations: async (): Promise<IntegrationStatus[]> => {
    return [
      {
        id: "INT1",
        provider: "mpesa",
        service_name: "M-Pesa B2C / STK Push",
        status: "active",
        api_key_masked: "pk_live_...8X9z",
        last_health_check: "2 mins ago",
        error_rate_24h: 0.1,
      },
      {
        id: "INT2",
        provider: "africastalking_sms",
        service_name: "Africa's Talking SMS",
        status: "active",
        api_key_masked: "atsk_...44Fq",
        account_balance: 4500,
        last_health_check: "5 mins ago",
        error_rate_24h: 0.5,
      },
      {
        id: "INT3",
        provider: "whatsapp_business",
        service_name: "Meta WhatsApp Cloud API",
        status: "degraded",
        api_key_masked: "EAAB_...99Pz",
        account_balance: 120,
        last_health_check: "1 min ago",
        error_rate_24h: 4.2,
      },
      {
        id: "INT4",
        provider: "google_maps",
        service_name: "Google Maps Geocoding",
        status: "active",
        api_key_masked: "AIza_...22Lm",
        last_health_check: "10 mins ago",
        error_rate_24h: 0.0,
      },
    ];
  },

  testIntegration: async (integrationId: string) => {
    return apiClient.post(`/api/admin/integrations/${integrationId}/test/`);
  },

  // 3. Platform Configurations
  getPlatformConfigs: async (): Promise<PlatformConfig[]> => {
    return [
      {
        id: "C1",
        key: "maintenance_mode",
        label: "Maintenance Mode",
        description: "Blocks public access and shows a maintenance page.",
        is_enabled: false,
        category: "security",
      },
      {
        id: "C2",
        key: "require_landlord_verification",
        label: "Mandatory Landlord Verification",
        description:
          "Landlords cannot publish listings until Admin verifies IDs.",
        is_enabled: true,
        category: "security",
      },
      {
        id: "C3",
        key: "auto_approve_listings",
        label: "Auto-Approve Marketplace Listings",
        description: "Bypasses admin moderation for verified landlords.",
        is_enabled: false,
        category: "marketplace",
      },
      {
        id: "C4",
        key: "auto_generate_invoices",
        label: "Automated Monthly Invoicing",
        description:
          "Celery task generates rent invoices on the 1st of every month.",
        is_enabled: true,
        category: "billing",
      },
      {
        id: "C5",
        key: "sms_rent_reminders",
        label: "SMS Rent Reminders",
        description: "Sends automated SMS to tenants 3 days before due date.",
        is_enabled: true,
        category: "notifications",
      },
    ];
  },

  updateConfig: async (configId: string, isEnabled: boolean) => {
    return apiClient.patch(`/api/admin/configs/${configId}/`, {
      is_enabled: isEnabled,
    });
  },

  // 4. Admin Accounts
  getAdminAccounts: async (): Promise<AdminAccount[]> => {
    return [
      {
        id: 1,
        full_name: "System Superadmin",
        email: "root@tennacy.com",
        role: "super_admin",
        is_active: true,
        two_factor_enabled: true,
        last_login: "2026-06-19 14:00",
      },
      {
        id: 2,
        full_name: "Jane Finance",
        email: "finance@tennacy.com",
        role: "finance_admin",
        is_active: true,
        two_factor_enabled: true,
        last_login: "2026-06-19 09:30",
      },
      {
        id: 3,
        full_name: "John Support",
        email: "support@tennacy.com",
        role: "support_admin",
        is_active: false,
        two_factor_enabled: false,
        last_login: "2026-05-10 11:00",
      },
    ];
  },

  createAdminAccount: async (data: Partial<AdminAccount>) => {
    return apiClient.post("/api/admin/accounts/", data);
  },
};
