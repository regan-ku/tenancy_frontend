import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface GlobalAuditLog {
  id: string;
  timestamp: string;
  user_name: string;
  user_role: string;
  app_module:
    | "accounts"
    | "properties"
    | "tenancies"
    | "payments"
    | "applications"
    | "marketplace"
    | "agencies"
    | "communications"
    | "maintenance"
    | "documents"
    | "integrations"
    | "reports";
  action_type:
    | "CREATE"
    | "UPDATE"
    | "DELETE"
    | "LOGIN"
    | "APPROVE"
    | "REJECT"
    | "EXPORT";
  target_entity: string;
  ip_address: string;
  user_agent: string;
  status: "SUCCESS" | "FAILED" | "BLOCKED";
}

export interface SecurityAlert {
  id: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  alert_type: string; // e.g., "Brute Force Attempt", "Unauthorized API Access"
  source_ip: string;
  description: string;
  timestamp: string;
  is_resolved: boolean;
}

export interface BlockedIP {
  id: string;
  ip_address: string;
  reason: string;
  blocked_at: string;
  expires_at: string | null; // null means permanent
}

// ==========================================
// API METHODS
// ==========================================
export const adminAuditApi = {
  // 1. Global Audit Logs
  getAuditLogs: async (filters?: {
    module?: string;
    action?: string;
  }): Promise<GlobalAuditLog[]> => {
    try {
      const response = await apiClient.get("/api/admin/audit/logs/", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      return [
        {
          id: "L1",
          timestamp: "2026-06-19 14:32:10",
          user_name: "Sarah Jenkins",
          user_role: "agency",
          app_module: "applications",
          action_type: "APPROVE",
          target_entity: "Rental App #1042 (David Miller)",
          ip_address: "192.168.1.45",
          user_agent: "Chrome/114.0 Mac",
          status: "SUCCESS",
        },
        {
          id: "L2",
          timestamp: "2026-06-19 14:15:00",
          user_name: "System Admin",
          user_role: "admin",
          app_module: "payments",
          action_type: "APPROVE",
          target_entity: "Paybill Account #88 (Nairobi Premier)",
          ip_address: "10.0.0.12",
          user_agent: "Safari/16.0 Mac",
          status: "SUCCESS",
        },
        {
          id: "L3",
          timestamp: "2026-06-19 13:45:22",
          user_name: "Unknown",
          user_role: "public",
          app_module: "accounts",
          action_type: "LOGIN",
          target_entity: "Login Attempt (admin@tennacy.com)",
          ip_address: "45.33.22.11",
          user_agent: "Python-Requests/2.28",
          status: "FAILED",
        },
        {
          id: "L4",
          timestamp: "2026-06-19 12:10:05",
          user_name: "John Doe",
          user_role: "landlord",
          app_module: "properties",
          action_type: "DELETE",
          target_entity: "Unit Group #44 (Bedsitters)",
          ip_address: "172.16.0.5",
          user_agent: "Chrome/114.0 Win",
          status: "SUCCESS",
        },
      ];
    }
  },

  exportAuditLogs: async (filters: any) => {
    return apiClient.get("/api/admin/audit/logs/export/", {
      params: filters,
      responseType: "blob",
    });
  },

  // 2. Security Alerts
  getSecurityAlerts: async (): Promise<SecurityAlert[]> => {
    return [
      {
        id: "S1",
        severity: "CRITICAL",
        alert_type: "Brute Force Login Attempt",
        source_ip: "45.33.22.11",
        description: "15 failed login attempts in 2 minutes for admin account.",
        timestamp: "2026-06-19 13:45:22",
        is_resolved: false,
      },
      {
        id: "S2",
        severity: "HIGH",
        alert_type: "Rate Limit Exceeded",
        source_ip: "89.12.44.55",
        description: "Marketplace search API hit 1000 requests/minute.",
        timestamp: "2026-06-19 10:20:00",
        is_resolved: true,
      },
    ];
  },

  // 3. IP Management
  getBlockedIPs: async (): Promise<BlockedIP[]> => {
    return [
      {
        id: "B1",
        ip_address: "45.33.22.11",
        reason: "Brute force attack on admin login",
        blocked_at: "2026-06-19 13:46:00",
        expires_at: null,
      },
      {
        id: "B2",
        ip_address: "89.12.44.55",
        reason: "API Scraping / Rate limit abuse",
        blocked_at: "2026-06-18 09:00:00",
        expires_at: "2026-06-25 09:00:00",
      },
    ];
  },

  blockIP: async (ip: string, reason: string, isPermanent: boolean) => {
    return apiClient.post("/api/admin/security/block-ip/", {
      ip,
      reason,
      is_permanent: isPermanent,
    });
  },

  unblockIP: async (blockId: string) => {
    return apiClient.delete(`/api/admin/security/block-ip/${blockId}/`);
  },
};
