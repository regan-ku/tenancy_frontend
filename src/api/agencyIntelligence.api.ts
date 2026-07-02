import apiClient from "@/api/axios";

// ==========================================
// REPORTS INTERFACES
// ==========================================
export interface PortfolioMetric {
  property_name: string;
  landlord_name: string;
  total_units: number;
  occupancy_rate: number;
  rent_collected: number;
  arrears: number;
  maintenance_open: number;
}

export interface MaintenanceAnalytics {
  total_requests: number;
  resolved_within_sla: number;
  breached_sla: number;
  avg_resolution_time_hours: number;
}

export interface LandlordStatement {
  id: string;
  landlord_name: string;
  period: string;
  gross_rent: number;
  agency_fee: number;
  net_payout: number;
  status: "generated" | "sent" | "downloaded";
}

// ==========================================
// COMMUNICATIONS INTERFACES
// ==========================================
export interface SystemNotification {
  id: string;
  type: "payment" | "application" | "maintenance" | "system" | "compliance";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  channel: "sms" | "whatsapp";
  audience_size: number;
  delivered: number;
  failed: number;
  status: "draft" | "scheduled" | "sent" | "failed";
  created_at: string;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  estimated_count: number;
}

// ==========================================
// API METHODS
// ==========================================
export const agencyIntelligenceApi = {
  // 1. REPORTS & ANALYTICS
  // ✅ FIXED: Updated to "/reports/reports/..." to match the DRF router's generated URL structure
  getPortfolioMetrics: async (): Promise<PortfolioMetric[]> => {
    const response = await apiClient.get("/reports/reports/portfolio-metrics/");
    return response.data;
  },

  getMaintenanceAnalytics: async (): Promise<MaintenanceAnalytics> => {
    const response = await apiClient.get(
      "/reports/reports/maintenance-analytics/",
    );
    return response.data;
  },

  getLandlordStatements: async (): Promise<LandlordStatement[]> => {
    const response = await apiClient.get(
      "/reports/reports/landlord-statements/",
    );
    return response.data;
  },

  generateStatementPDF: async (statementId: string) => {
    // ✅ FIXED: Updated to "/reports/reports/..."
    const response = await apiClient.get(
      `/reports/reports/statements/${statementId}/export/pdf/`,
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `statement-${statementId}.pdf`);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  exportPortfolioExcel: async () => {
    // ✅ FIXED: Updated to "/reports/reports/..."
    const response = await apiClient.get(
      "/reports/reports/export/portfolio/excel/",
      {
        responseType: "blob",
      },
    );

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `portfolio-report-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  generateReport: async (
    title: string,
    reportType: string,
    parameters: any = {},
  ) => {
    // ✅ FIXED: Updated to "/reports/reports/..."
    const response = await apiClient.post("/reports/reports/", {
      title,
      report_type: reportType,
      parameters,
    });
    return response.data;
  },

  // 2. COMMUNICATIONS & CAMPAIGNS
  getNotifications: async (): Promise<SystemNotification[]> => {
    const response = await apiClient.get("/communications/notifications/");
    return response.data;
  },

  markNotificationRead: async (id: string) => {
    const response = await apiClient.patch(
      `/communications/notifications/${id}/read/`,
    );
    return response.data;
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    const response = await apiClient.get("/communications/campaigns/");
    return response.data;
  },

  getAudienceSegments: async (): Promise<AudienceSegment[]> => {
    const response = await apiClient.get(
      "/communications/campaigns/audience-segments/",
    );
    return response.data;
  },

  sendCampaign: async (data: any) => {
    const response = await apiClient.post("/communications/campaigns/", data);
    return response.data;
  },
};
