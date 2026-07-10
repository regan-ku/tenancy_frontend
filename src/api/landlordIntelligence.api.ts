import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export interface PropertyMetric {
  property_name: string;
  total_units: number;
  occupied_units: number;
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

export interface FinancialStatement {
  id: string;
  period: string;
  gross_income: number;
  agency_fees: number;
  maintenance_costs: number;
  net_payout: number;
  status: "generated" | "sent" | "downloaded";
  generated_at: string;
}

export interface LandlordKPIs {
  total_properties: number;
  total_units: number;
  overall_occupancy: number;
  total_income: number;
  total_arrears: number;
}

// ==========================================
// API METHODS
// ==========================================
export const landlordIntelligenceApi = {
  // 1. DASHBOARD KPIs
  getKPIs: async (): Promise<LandlordKPIs> => {
    // ✅ Matches @action(url_path='dashboard') on ReportViewSet
    const response = await apiClient.get("/reports/reports/dashboard/");
    return response.data;
  },

  // 2. PROPERTY PERFORMANCE
  getPropertyMetrics: async (): Promise<PropertyMetric[]> => {
    const response = await apiClient.get("/reports/reports/portfolio-metrics/");
    return response.data;
  },

  // 3. MAINTENANCE & SLAs
  getMaintenanceAnalytics: async (): Promise<MaintenanceAnalytics> => {
    const response = await apiClient.get(
      "/reports/reports/maintenance-analytics/",
    );
    return response.data;
  },

  // 4. FINANCIAL STATEMENTS
  getFinancialStatements: async (): Promise<FinancialStatement[]> => {
    const response = await apiClient.get(
      "/reports/reports/landlord-statements/",
    );
    return response.data;
  },

  // 5. EXPORTS & DOWNLOADS
  exportPortfolioExcel: async () => {
    // ✅ Matches @action(url_path='export/portfolio/excel') on ReportViewSet
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
      `landlord-portfolio-${new Date().toISOString().split("T")[0]}.xlsx`,
    );
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    return { success: true };
  },

  downloadStatementPDF: async (statementId: string) => {
    // ✅ Matches @action(url_path='statements/<id>/export/pdf') on ReportViewSet
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

  generateReport: async (
    title: string,
    reportType: string,
    parameters: any = {},
  ) => {
    const response = await apiClient.post("/reports/reports/", {
      title,
      report_type: reportType,
      parameters,
    });
    return response.data;
  },
};
