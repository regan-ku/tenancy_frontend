import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

// ==========================================
// INTERFACES
// ==========================================
export interface ReportConfig {
  id: string;
  type: "rent_collection" | "arrears" | "occupancy" | "property_performance";
  title: string;
  generated_at: string;
  format: "pdf" | "excel";
  status: "ready" | "processing";
}

export interface Notification {
  id: string;
  type: "payment" | "maintenance" | "application" | "system" | "campaign";
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  channel: "sms" | "whatsapp";
  content: string;
}

// ==========================================
// API METHODS
// ==========================================
export const reportsApi = {
  // 1. Reports Generation & Download
  generateReport: async (type: string, filters: any): Promise<ReportConfig> => {
    const response = await apiClient.post(endpoints.REPORTS.GENERATE_REPORT, {
      type,
      filters,
    });
    return response.data;
  },

  getRecentReports: async (): Promise<ReportConfig[]> => {
    try {
      const response = await apiClient.get(endpoints.REPORTS.REPORTS_LIST);
      return response.data;
    } catch (error) {
      // Mock Data
      return [
        {
          id: "RPT-001",
          type: "rent_collection",
          title: "June 2026 Rent Roll",
          generated_at: "2026-06-15",
          format: "pdf",
          status: "ready",
        },
        {
          id: "RPT-002",
          type: "arrears",
          title: "Outstanding Arrears Report",
          generated_at: "2026-06-14",
          format: "excel",
          status: "ready",
        },
        {
          id: "RPT-003",
          type: "occupancy",
          title: "Q2 Occupancy Analytics",
          generated_at: "2026-06-10",
          format: "pdf",
          status: "ready",
        },
      ];
    }
  },

  downloadReport: async (reportId: string, format: "pdf" | "excel") => {
    const endpoint =
      format === "pdf"
        ? endpoints.REPORTS.DOWNLOAD_REPORT(
            parseInt(reportId.replace("RPT-", "")),
          )
        : `${endpoints.REPORTS.REPORTS_LIST}${reportId}/export/excel/`;

    const response = await apiClient.get(endpoint, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Report-${reportId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  // 2. Communications & Notifications
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await apiClient.get(
        endpoints.COMMUNICATIONS.NOTIFICATIONS,
      );
      return response.data;
    } catch (error) {
      return [
        {
          id: "N1",
          type: "payment",
          title: "Payment Received",
          message: "KES 15,000 received from John Doe (A-101).",
          is_read: false,
          created_at: "2 mins ago",
        },
        {
          id: "N2",
          type: "maintenance",
          title: "Emergency Alert",
          message: "Water leak reported in Unit B-204.",
          is_read: false,
          created_at: "1 hour ago",
        },
        {
          id: "N3",
          type: "application",
          title: "New Application",
          message: "David Miller applied for Unit A-102.",
          is_read: true,
          created_at: "3 hours ago",
        },
      ];
    }
  },

  markAsRead: async (notifId: string) => {
    return apiClient.patch(endpoints.COMMUNICATIONS.MARK_READ(notifId));
  },

  // 3. Campaigns (Bulk Messaging)
  getCampaignTemplates: async (): Promise<CampaignTemplate[]> => {
    return [
      {
        id: "T1",
        name: "Rent Reminder (Polite)",
        channel: "sms",
        content:
          "Dear {tenant_name}, a gentle reminder that your rent of {amount} for {unit} is due on {date}.",
      },
      {
        id: "T2",
        name: "Overdue Notice (Urgent)",
        channel: "whatsapp",
        content:
          "URGENT: Your rent for {unit} is overdue. Please clear your balance of {amount} immediately to avoid penalties.",
      },
    ];
  },

  sendBroadcast: async (
    templateId: string,
    audience: string,
    channel: "sms" | "whatsapp",
  ) => {
    return apiClient.post(endpoints.COMMUNICATIONS.TEMPLATES, {
      template_id: templateId,
      audience,
      channel,
    });
  },
};
