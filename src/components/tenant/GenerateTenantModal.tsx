"use client";

import React, { useState } from "react";
import {
  tenantReportsApi,
  TenantReportType,
  ExportFormat,
  TenantReportRequest,
} from "@/api/tenantReports.api";
import { PersonalTenancy } from "@/api/tenantDashboard.api";

interface GenerateTenantReportModalProps {
  reportType: TenantReportType;
  tenancies: PersonalTenancy[];
  onClose: () => void;
  onSuccess: (report: any) => void;
}

export default function GenerateTenantReportModal({
  reportType,
  tenancies,
  onClose,
  onSuccess,
}: GenerateTenantReportModalProps) {
  const [selectedTenancyIds, setSelectedTenancyIds] = useState<number[]>(
    tenancies.map((t) => t.id),
  );
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState(new Date().toISOString().split("T")[0]);
  const [format, setFormat] = useState<ExportFormat>("pdf");
  const [isGenerating, setIsGenerating] = useState(false);

  const toggleTenancy = (id: number) => {
    setSelectedTenancyIds((prev) =>
      prev.includes(id) ? prev.filter((tid) => tid !== id) : [...prev, id],
    );
  };

  const selectAll = () => {
    setSelectedTenancyIds(tenancies.map((t) => t.id));
  };

  const handleGenerate = async () => {
    if (selectedTenancyIds.length === 0)
      return alert("Please select at least one property.");

    setIsGenerating(true);
    try {
      const payload: TenantReportRequest = {
        report_type: reportType,
        tenancy_ids: selectedTenancyIds,
        date_from: reportType === "payment_statement" ? dateFrom : undefined,
        date_to: reportType === "payment_statement" ? dateTo : undefined,
        format,
      };

      const result = await tenantReportsApi.generateReport(payload);
      onSuccess(result);
    } catch (error) {
      alert("Failed to generate report. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getTitle = () => {
    switch (reportType) {
      case "payment_statement":
        return "Generate Rent Payment Statement";
      case "maintenance_log":
        return "Generate Maintenance History Log";
      case "proof_of_tenancy":
        return "Generate Proof of Tenancy";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-xl font-bold text-primary-dark">{getTitle()}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* 1. Select Properties */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-500 uppercase">
                1. Select Properties to Include
              </label>
              <button
                onClick={selectAll}
                className="text-[10px] text-primary font-bold hover:underline"
              >
                Select All
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 border border-slate-200 rounded-xl p-3">
              {tenancies.map((t) => (
                <label
                  key={t.id}
                  className="flex items-center gap-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedTenancyIds.includes(t.id)}
                    onChange={() => toggleTenancy(t.id)}
                    className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  />
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {t.property_name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Unit {t.unit_code} • {t.unit_type}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* 2. Date Range (Only for Payment Statements) */}
          {reportType === "payment_statement" && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                2. Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-400">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. Export Format */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              {reportType === "payment_statement" ? "3" : "2"}. Export Format
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat("pdf")}
                className={`py-3 rounded-lg border font-bold text-sm uppercase transition-all ${format === "pdf" ? "bg-red-50 border-red-500 text-red-700 ring-2 ring-red-200" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                📄 PDF Document
              </button>
              <button
                onClick={() => setFormat("excel")}
                className={`py-3 rounded-lg border font-bold text-sm uppercase transition-all ${format === "excel" ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                📊 Excel (XLSX)
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            {reportType === "proof_of_tenancy" ? (
              <p>
                <strong>📜 Official Letter:</strong> This document will be
                digitally signed by the system and include the official stamp of
                your property management (Agency or Landlord).
              </p>
            ) : (
              <p>
                <strong>🔒 Data Privacy:</strong> This report contains only your
                personal tenancy data. No information about other tenants or the
                property owner's private financials will be included.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Generating Document...
              </>
            ) : (
              "🚀 Generate & Download"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
