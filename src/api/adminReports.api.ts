import apiClient from "@/api/axios";

// ==========================================
// INTERFACES
// ==========================================
export type ReportDomain =
  | "financial"
  | "occupancy"
  | "tenancy"
  | "property"
  | "marketplace"
  | "maintenance"
  | "application"
  | "communication";

export type ReportScope =
  | "global"
  | "agency"
  | "landlord"
  | "property"
  | "tenant";

export type ExportFormat = "pdf" | "excel" | "csv";

export interface ReportGenerationRequest {
  domain: ReportDomain;
  scope: ReportScope;
  target_id?: number; // ID of the specific agency, landlord, property, or tenant
  date_from: string;
  date_to: string;
  format: ExportFormat;
}

export interface GeneratedReport {
  id: string;
  title: string;
  domain: ReportDomain;
  scope: ReportScope;
  target_name: string; // e.g., "Global", "Nairobi Premier Realtors", "John Doe"
  generated_at: string;
  format: ExportFormat;
  file_size: string;
  status: "ready" | "processing" | "failed";
  download_url?: string;
}

// Mock options for the Scope selectors
export const SCOPE_OPTIONS = {
  agency: [
    { id: 1, name: "Nairobi Premier Realtors" },
    { id: 2, name: "Westlands Properties Ltd" },
  ],
  landlord: [
    { id: 10, name: "David Miller" },
    { id: 11, name: "Sarah Connor" },
    { id: 12, name: "Bruce Wayne" },
  ],
  property: [
    { id: 100, name: "Kilimani Heights" },
    { id: 101, name: "Lavington Villas" },
  ],
  tenant: [
    { id: 1000, name: "Alice Smith (Unit B-204)" },
    { id: 1001, name: "Mike Ross (Unit V-02)" },
  ],
};

// ==========================================
// API METHODS
// ==========================================
export const adminReportsApi = {
  generateReport: async (
    data: ReportGenerationRequest,
  ): Promise<GeneratedReport> => {
    // Simulate API delay for report generation
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      id: `RPT-${Date.now()}`,
      title: `${data.domain.toUpperCase()} REPORT (${data.scope.toUpperCase()})`,
      domain: data.domain,
      scope: data.scope,
      target_name:
        data.scope === "global" ? "Entire Platform" : "Specific Entity",
      generated_at: new Date().toISOString(),
      format: data.format,
      file_size: "2.4 MB",
      status: "ready",
      download_url: "#",
    };
  },

  getReportHistory: async (): Promise<GeneratedReport[]> => {
    return [
      {
        id: "RPT-001",
        title: "GLOBAL FINANCIAL RECONCILIATION",
        domain: "financial",
        scope: "global",
        target_name: "Entire Platform",
        generated_at: "2026-06-18 09:00",
        format: "pdf",
        file_size: "4.1 MB",
        status: "ready",
      },
      {
        id: "RPT-002",
        title: "OCCUPANCY ANALYTICS",
        domain: "occupancy",
        scope: "agency",
        target_name: "Nairobi Premier Realtors",
        generated_at: "2026-06-17 14:30",
        format: "excel",
        file_size: "1.2 MB",
        status: "ready",
      },
      {
        id: "RPT-003",
        title: "TENANT LEDGER & ARREARS",
        domain: "tenancy",
        scope: "landlord",
        target_name: "David Miller",
        generated_at: "2026-06-16 10:15",
        format: "csv",
        file_size: "850 KB",
        status: "ready",
      },
      {
        id: "RPT-004",
        title: "MAINTENANCE SLA BREACHES",
        domain: "maintenance",
        scope: "property",
        target_name: "Kilimani Heights",
        generated_at: "2026-06-15 08:00",
        format: "pdf",
        file_size: "1.5 MB",
        status: "ready",
      },
    ];
  },

  downloadReport: async (reportId: string) => {
    // In production, this triggers a blob download
    return { success: true };
  },
};
