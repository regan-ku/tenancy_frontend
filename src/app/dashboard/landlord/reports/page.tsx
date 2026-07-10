"use client";

import React, { useState, useEffect } from "react";
import {
  landlordIntelligenceApi,
  PropertyMetric,
  MaintenanceAnalytics,
  FinancialStatement,
  LandlordKPIs,
} from "@/api/landlordIntelligence.api";

export default function LandlordReportsPage() {
  const [kpis, setKpis] = useState<LandlordKPIs | null>(null);
  const [metrics, setMetrics] = useState<PropertyMetric[]>([]);
  const [maintAnalytics, setMaintAnalytics] =
    useState<MaintenanceAnalytics | null>(null);
  const [statements, setStatements] = useState<FinancialStatement[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);
  const [exportingExcel, setExportingExcel] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "portfolio" | "operations" | "statements"
  >("portfolio");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [k, m, ma, s] = await Promise.all([
        landlordIntelligenceApi.getKPIs(),
        landlordIntelligenceApi.getPropertyMetrics(),
        landlordIntelligenceApi.getMaintenanceAnalytics(),
        landlordIntelligenceApi.getFinancialStatements(),
      ]);
      setKpis(k);
      setMetrics(m);
      setMaintAnalytics(ma);
      setStatements(s);
    } catch (err: any) {
      console.error("Failed to fetch reports data", err);
      setError("Failed to load analytics data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setExportingExcel(true);
    try {
      await landlordIntelligenceApi.exportPortfolioExcel();
    } catch (err) {
      console.error("Failed to export Excel", err);
      alert("Failed to export data. Please try again.");
    } finally {
      setExportingExcel(false);
    }
  };

  const handleDownloadPDF = async (statementId: string) => {
    setDownloadingPdfId(statementId);
    try {
      await landlordIntelligenceApi.downloadStatementPDF(statementId);
    } catch (err) {
      console.error("Failed to download PDF", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdfId(null);
    }
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Deduplicate statements by ID to prevent duplicate rows
  const uniqueStatements = statements.filter(
    (statement, index, self) =>
      index === self.findIndex((t) => t.id === statement.id),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Reports & Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Read-only analytics across your property portfolio. Track
            performance, SLAs, and financial statements.
          </p>
        </div>
        <button
          onClick={handleExportExcel}
          disabled={exportingExcel}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50"
        >
          {exportingExcel ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          ) : (
            <svg
              className="w-4 h-4"
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
          )}
          {exportingExcel ? "Exporting..." : "Export All Data (Excel)"}
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={fetchData}
            className="text-sm font-bold underline hover:text-red-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading || !kpis ? (
          Array.from({ length: 4 }).map((_, i) => <KPISkeleton key={i} />)
        ) : (
          <>
            <KPICard
              title="Total Properties"
              value={kpis.total_properties}
              icon="🏢"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Overall Occupancy"
              value={`${kpis.overall_occupancy}%`}
              icon="📈"
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Total Income"
              value={formatCurrency(kpis.total_income)}
              icon="💰"
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Total Arrears"
              value={formatCurrency(kpis.total_arrears)}
              icon="⚠️"
              color="bg-red-50 text-red-600"
            />
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "portfolio", label: "Property Performance" },
            { key: "operations", label: "Maintenance & SLAs" },
            { key: "statements", label: "Financial Statements" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* PORTFOLIO TAB */}
        {activeTab === "portfolio" && (
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={5} />
            ) : metrics.length === 0 ? (
              <EmptyState message="No properties found in your portfolio." />
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Units & Occupancy</th>
                    <th className="px-6 py-4">Rent Collected</th>
                    <th className="px-6 py-4">Arrears</th>
                    <th className="px-6 py-4">Open Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {metrics.map((m, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {m.property_name}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {m.total_units} Units
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-16 bg-slate-200 rounded-full h-1.5">
                            <div
                              className="bg-green-500 h-1.5 rounded-full"
                              style={{ width: `${m.occupancy_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-bold text-green-600">
                            {m.occupancy_rate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-extrabold text-green-600">
                        {formatCurrency(m.rent_collected)}
                      </td>
                      <td className="px-6 py-4 font-bold text-red-600">
                        {formatCurrency(m.arrears)}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            m.maintenance_open > 0
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {m.maintenance_open}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* OPERATIONS TAB */}
        {activeTab === "operations" && (
          <div className="p-8 space-y-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-24 bg-slate-100 animate-pulse rounded-xl"
                  ></div>
                ))}
              </div>
            ) : maintAnalytics ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 text-center">
                    <p className="text-3xl font-extrabold text-primary-dark">
                      {maintAnalytics.total_requests}
                    </p>
                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                      Total Requests
                    </p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-100 text-center">
                    <p className="text-3xl font-extrabold text-green-700">
                      {maintAnalytics.resolved_within_sla}
                    </p>
                    <p className="text-xs text-green-600 font-bold uppercase mt-1">
                      Resolved On Time
                    </p>
                  </div>
                  <div className="p-5 bg-red-50 rounded-xl border border-red-100 text-center">
                    <p className="text-3xl font-extrabold text-red-700">
                      {maintAnalytics.breached_sla}
                    </p>
                    <p className="text-xs text-red-600 font-bold uppercase mt-1">
                      SLA Breaches
                    </p>
                  </div>
                  <div className="p-5 bg-blue-50 rounded-xl border border-blue-100 text-center">
                    <p className="text-3xl font-extrabold text-blue-700">
                      {maintAnalytics.avg_resolution_time_hours}h
                    </p>
                    <p className="text-xs text-blue-600 font-bold uppercase mt-1">
                      Avg Resolution
                    </p>
                  </div>
                </div>

                {maintAnalytics.total_requests > 0 && (
                  <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
                    <strong>Operational Insight:</strong> Your maintenance team
                    is resolving{" "}
                    {Math.round(
                      (maintAnalytics.resolved_within_sla /
                        maintAnalytics.total_requests) *
                        100,
                    )}
                    % of issues within the SLA.
                    {maintAnalytics.breached_sla > 0 &&
                      ` Consider reviewing the ${maintAnalytics.breached_sla} breached tickets to improve response times.`}
                  </div>
                )}
              </>
            ) : (
              <EmptyState message="No maintenance data available." />
            )}
          </div>
        )}

        {/* STATEMENTS TAB */}
        {activeTab === "statements" && (
          <div className="overflow-x-auto">
            {loading ? (
              <TableSkeleton rows={3} />
            ) : uniqueStatements.length === 0 ? (
              <EmptyState message="No financial statements generated for this period." />
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Period</th>
                    <th className="px-6 py-4">Gross Income</th>
                    <th className="px-6 py-4">Agency Fees</th>
                    <th className="px-6 py-4">Maintenance Costs</th>
                    <th className="px-6 py-4">Net Payout</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {uniqueStatements.map((s) => (
                    <tr
                      key={s.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-800">
                        {s.period}
                      </td>
                      <td className="px-6 py-4 text-slate-700">
                        {formatCurrency(s.gross_income)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        - {formatCurrency(s.agency_fees)}
                      </td>
                      <td className="px-6 py-4 text-red-600 font-medium">
                        - {formatCurrency(s.maintenance_costs)}
                      </td>
                      <td className="px-6 py-4 font-extrabold text-green-600">
                        {formatCurrency(s.net_payout)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleDownloadPDF(s.id)}
                          disabled={downloadingPdfId === s.id}
                          className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-1 ml-auto disabled:opacity-50"
                        >
                          {downloadingPdfId === s.id ? (
                            <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
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
                          )}
                          {downloadingPdfId === s.id
                            ? "Generating..."
                            : "Download PDF"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function KPICard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className="text-xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}

function KPISkeleton() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 animate-pulse">
      <div className="w-10 h-10 bg-slate-200 rounded-xl mb-3"></div>
      <div className="h-3 bg-slate-200 rounded w-1/2 mb-2"></div>
      <div className="h-6 bg-slate-200 rounded w-3/4"></div>
    </div>
  );
}

function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="p-6 space-y-4 animate-pulse">
      <div className="h-4 bg-slate-200 rounded w-full"></div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 bg-slate-100 rounded w-full"></div>
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 text-center text-slate-400">
      <svg
        className="w-12 h-12 mx-auto mb-3 text-slate-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
        />
      </svg>
      <p className="font-medium">{message}</p>
    </div>
  );
}
