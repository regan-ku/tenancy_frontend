import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type TenantReportType =
  | "payment_statement"
  | "maintenance_log"
  | "proof_of_tenancy";
export type ExportFormat = "pdf" | "excel";

export interface TenantReportRequest {
  report_type: TenantReportType;
  tenancy_ids: number[]; // Can be one or multiple
  date_from?: string;
  date_to?: string;
  format: ExportFormat;
}

export interface GeneratedTenantReport {
  id: string;
  title: string;
  report_type: TenantReportType;
  generated_at: string;
  format: ExportFormat;
  file_size: string;
  download_url: string;
}

// ==========================================
// API METHODS
// ==========================================
export const tenantReportsApi = {
  // 1. Generate a new personal report
  generateReport: async (
    data: TenantReportRequest,
  ): Promise<GeneratedTenantReport> => {
    // Simulate backend processing time for PDF generation
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const typeLabels = {
      payment_statement: "Rent Payment Statement",
      maintenance_log: "Maintenance History Log",
      proof_of_tenancy: "Proof of Tenancy & Good Standing",
    };

    return {
      id: `TR-${Date.now()}`,
      title: `${typeLabels[data.report_type]} (${data.tenancy_ids.length} Properties)`,
      report_type: data.report_type,
      generated_at: new Date().toISOString(),
      format: data.format,
      file_size: "1.2 MB",
      download_url: "#", // In production, returns a secure cloud URL
    };
  },

  // 2. Get history of generated reports
  getReportHistory: async (): Promise<GeneratedTenantReport[]> => {
    return [
      {
        id: "TR-101",
        title: "Rent Payment Statement (2025)",
        report_type: "payment_statement",
        generated_at: "2026-01-05 10:00",
        format: "pdf",
        file_size: "850 KB",
        download_url: "#",
      },
      {
        id: "TR-102",
        title: "Proof of Tenancy - Kilimani B-204",
        report_type: "proof_of_tenancy",
        generated_at: "2026-03-12 14:30",
        format: "pdf",
        file_size: "420 KB",
        download_url: "#",
      },
    ];
  },

  // 3. Download Report
  downloadReport: async (reportId: string) => {
    // Triggers browser download
    window.open(`/api/reports/download/${reportId}/`, "_blank");
  },
};
