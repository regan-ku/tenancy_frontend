"use client";

import React, { useState, useEffect } from "react";
import { adminReportsApi, GeneratedReport } from "@/api/adminReports.api";
import GlobalReportGenerator from "@/components/admin/GlobalReportGenerator";

export default function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState<"generator" | "history">(
    "generator",
  );
  const [history, setHistory] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminReportsApi.getReportHistory().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  const handleNewReportGenerated = (newReport: GeneratedReport) => {
    setHistory([newReport, ...history]);
    setActiveTab("history"); // Auto-switch to history to show the result
  };

  const handleDownload = async (reportId: string) => {
    await adminReportsApi.downloadReport(reportId);
    alert("✅ Report download started.");
  };

  const getDomainBadge = (domain: string) => {
    const colors: Record<string, string> = {
      financial: "bg-green-100 text-green-700",
      occupancy: "bg-blue-100 text-blue-700",
      tenancy: "bg-purple-100 text-purple-700",
      property: "bg-orange-100 text-orange-700",
      marketplace: "bg-pink-100 text-pink-700",
      maintenance: "bg-yellow-100 text-yellow-700",
      application: "bg-indigo-100 text-indigo-700",
      communication: "bg-slate-100 text-slate-700",
    };
    return colors[domain] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Platform Intelligence & Report Engine
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Generate exhaustive, multi-dimensional reports across all system
          domains and hierarchical levels (Global, Agency, Landlord, Tenant).
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          <button
            onClick={() => setActiveTab("generator")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "generator" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Report Generator
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
          >
            Generated Reports Archive ({history.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "generator" ? (
        <GlobalReportGenerator onReportGenerated={handleNewReportGenerated} />
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Report Title & Domain</th>
                  <th className="px-6 py-4">Scope / Target</th>
                  <th className="px-6 py-4">Format</th>
                  <th className="px-6 py-4">Generated</th>
                  <th className="px-6 py-4">Size</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-slate-400"
                    >
                      Loading archive...
                    </td>
                  </tr>
                ) : (
                  history.map((report) => (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800 text-xs font-mono">
                          {report.title}
                        </p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getDomainBadge(report.domain)}`}
                        >
                          {report.domain}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-500 uppercase">
                          {report.scope}
                        </p>
                        <p className="text-sm text-slate-700">
                          {report.target_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">
                          {report.format}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {report.generated_at}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {report.file_size}
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
      )}
    </div>
  );
}
