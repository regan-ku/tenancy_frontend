"use client";

import React, { useState, useEffect } from "react";
import {
  tenantReportsApi,
  GeneratedTenantReport,
  TenantReportType,
} from "@/api/tenantReports.api";
import { tenantDashboardApi, PersonalTenancy } from "@/api/tenantDashboard.api";
import GenerateTenantReportModal from "@/components/tenant/GenerateTenantModal";

export default function TenantReportsPage() {
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [history, setHistory] = useState<GeneratedTenantReport[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedReportType, setSelectedReportType] =
    useState<TenantReportType | null>(null);

  useEffect(() => {
    Promise.all([
      tenantDashboardApi.getMyPersonalTenancies(),
      tenantReportsApi.getReportHistory(),
    ]).then(([tens, hist]) => {
      setTenancies(tens);
      setHistory(hist);
      setLoading(false);
    });
  }, []);

  const handleOpenModal = (type: TenantReportType) => {
    setSelectedReportType(type);
    setShowModal(true);
  };

  const handleReportGenerated = (newReport: GeneratedTenantReport) => {
    setHistory([newReport, ...history]);
    setShowModal(false);
  };

  const handleDownload = async (reportId: string) => {
    await tenantReportsApi.downloadReport(reportId);
  };

  const getReportIcon = (type: TenantReportType) => {
    switch (type) {
      case "payment_statement":
        return "💰";
      case "maintenance_log":
        return "🛠️";
      case "proof_of_tenancy":
        return "📜";
      default:
        return "📄";
    }
  };

  const getReportColor = (type: TenantReportType) => {
    switch (type) {
      case "payment_statement":
        return "bg-green-50 text-green-600 border-green-100";
      case "maintenance_log":
        return "bg-orange-50 text-orange-600 border-orange-100";
      case "proof_of_tenancy":
        return "bg-blue-50 text-blue-600 border-blue-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          My Reports & Statements
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate official documents for your personal records, accounting, or
          proof of residence.
        </p>
      </div>

      {/* Quick Generate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ReportActionCard
          type="payment_statement"
          title="Rent Payment Statement"
          description="Download a comprehensive ledger of all rent paid, dates, and receipts. Useful for accounting or reimbursements."
          icon={getReportIcon("payment_statement")}
          color={getReportColor("payment_statement")}
          onClick={() => handleOpenModal("payment_statement")}
        />
        <ReportActionCard
          type="maintenance_log"
          title="Maintenance History Log"
          description="Export a detailed timeline of all issues reported, repairs completed, and technician notes for your records."
          icon={getReportIcon("maintenance_log")}
          color={getReportColor("maintenance_log")}
          onClick={() => handleOpenModal("maintenance_log")}
        />
        <ReportActionCard
          type="proof_of_tenancy"
          title="Proof of Tenancy & Good Standing"
          description="Generate an official letter proving your residency and payment status. Often required by banks, schools, or government agencies."
          icon={getReportIcon("proof_of_tenancy")}
          color={getReportColor("proof_of_tenancy")}
          onClick={() => handleOpenModal("proof_of_tenancy")}
        />
      </div>

      {/* Report History */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Previously Generated Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Access and re-download documents you have previously generated.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Document Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4">Format</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading reports...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No reports generated yet. Use the cards above to create your
                    first report.
                  </td>
                </tr>
              ) : (
                history.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {report.title}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded uppercase ${getReportColor(report.report_type)}`}
                      >
                        <span>{getReportIcon(report.report_type)}</span>
                        {report.report_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {report.generated_at}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">
                        {report.format}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-1 ml-auto"
                      >
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Modal */}
      {showModal && selectedReportType && (
        <GenerateTenantReportModal
          reportType={selectedReportType}
          tenancies={tenancies}
          onClose={() => setShowModal(false)}
          onSuccess={handleReportGenerated}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function ReportActionCard({
  type,
  title,
  description,
  icon,
  color,
  onClick,
}: any) {
  return (
    <button
      onClick={onClick}
      className={`p-6 rounded-2xl border text-left hover:shadow-md transition-all group ${color}`}
    >
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-xs text-slate-600 leading-relaxed mb-4">
        {description}
      </p>
      <span className="text-xs font-bold text-primary-dark flex items-center gap-1 group-hover:gap-2 transition-all">
        Generate Report
        <svg
          className="w-3 h-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </span>
    </button>
  );
}
