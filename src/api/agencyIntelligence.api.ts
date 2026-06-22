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
  getPortfolioMetrics: async (): Promise<PortfolioMetric[]> => {
    return [
      {
        property_name: "Kilimani Heights",
        landlord_name: "David Miller",
        total_units: 40,
        occupancy_rate: 95,
        rent_collected: 2850000,
        arrears: 150000,
        maintenance_open: 3,
      },
      {
        property_name: "Westlands Plaza",
        landlord_name: "Sarah Connor",
        total_units: 12,
        occupancy_rate: 83,
        rent_collected: 900000,
        arrears: 200000,
        maintenance_open: 1,
      },
      {
        property_name: "Lavington Villas",
        landlord_name: "John Doe",
        total_units: 10,
        occupancy_rate: 100,
        rent_collected: 800000,
        arrears: 0,
        maintenance_open: 0,
      },
    ];
  },

  getMaintenanceAnalytics: async (): Promise<MaintenanceAnalytics> => {
    return {
      total_requests: 142,
      resolved_within_sla: 128,
      breached_sla: 14,
      avg_resolution_time_hours: 18,
    };
  },

  getLandlordStatements: async (): Promise<LandlordStatement[]> => {
    return [
      {
        id: "ST-001",
        landlord_name: "David Miller",
        period: "June 2026",
        gross_rent: 2850000,
        agency_fee: 285000,
        net_payout: 2565000,
        status: "sent",
      },
      {
        id: "ST-002",
        landlord_name: "Sarah Connor",
        period: "June 2026",
        gross_rent: 900000,
        agency_fee: 90000,
        net_payout: 810000,
        status: "generated",
      },
    ];
  },

  generateStatementPDF: async (statementId: string) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true, url: `/downloads/${statementId}.pdf` };
  },

  // 2. COMMUNICATIONS & CAMPAIGNS
  getNotifications: async (): Promise<SystemNotification[]> => {
    return [
      {
        id: "N1",
        type: "payment",
        title: "Rent Received",
        message: "KES 45,000 received for Kilimani Heights, Unit B-204.",
        is_read: false,
        created_at: "10 mins ago",
      },
      {
        id: "N2",
        type: "maintenance",
        title: "SLA Breach Alert",
        message:
          "Emergency plumbing issue at Westlands Plaza exceeds 2-hour SLA.",
        is_read: false,
        created_at: "1 hour ago",
      },
      {
        id: "N3",
        type: "application",
        title: "New Application",
        message: "David Miller applied for Lavington Villas, Unit V-02.",
        is_read: true,
        created_at: "3 hours ago",
      },
      {
        id: "N4",
        type: "compliance",
        title: "Director Verification",
        message: "Agency director Jane Smith's ID was verified by Admin.",
        is_read: true,
        created_at: "Yesterday",
      },
    ];
  },

  markNotificationRead: async (id: string) => {
    return apiClient.patch(`/api/communications/notifications/${id}/read/`);
  },

  getCampaigns: async (): Promise<Campaign[]> => {
    return [
      {
        id: "C1",
        name: "June Rent Reminders",
        channel: "whatsapp",
        audience_size: 340,
        delivered: 335,
        failed: 5,
        status: "sent",
        created_at: "2026-06-01",
      },
      {
        id: "C2",
        name: "Water Rationing Notice",
        channel: "sms",
        audience_size: 40,
        delivered: 40,
        failed: 0,
        status: "sent",
        created_at: "2026-06-10",
      },
      {
        id: "C3",
        name: "Q3 Arrears Escalation",
        channel: "sms",
        audience_size: 12,
        delivered: 0,
        failed: 0,
        status: "scheduled",
        created_at: "2026-06-18",
      },
    ];
  },

  getAudienceSegments: async (): Promise<AudienceSegment[]> => {
    return [
      {
        id: "A1",
        name: "All Active Tenants",
        description:
          "Every tenant with an active tenancy across all delegated properties.",
        estimated_count: 340,
      },
      {
        id: "A2",
        name: "Overdue Tenants",
        description: "Tenants with outstanding arrears > 0.",
        estimated_count: 12,
      },
      {
        id: "A3",
        name: "Kilimani Heights Residents",
        description: "Tenants specifically assigned to Kilimani Heights.",
        estimated_count: 38,
      },
      {
        id: "A4",
        name: "Leases Expiring in 30 Days",
        description: "Tenants approaching lease renewal window.",
        estimated_count: 8,
      },
    ];
  },

  sendCampaign: async (data: any) => {
    return apiClient.post("/api/communications/campaigns/", data);
  },
};
