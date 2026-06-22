"use client";

import React, { useState } from "react";
import {
  adminReportsApi,
  ReportDomain,
  ReportScope,
  ExportFormat,
  SCOPE_OPTIONS,
  ReportGenerationRequest,
} from "@/api/adminReports.api";

interface GlobalReportGeneratorProps {
  onReportGenerated: (report: any) => void;
}

export default function GlobalReportGenerator({
  onReportGenerated,
}: GlobalReportGeneratorProps) {
  const [domain, setDomain] = useState<ReportDomain>("financial");
  const [scope, setScope] = useState<ReportScope>("global");
  const [targetId, setTargetId] = useState<string>("");
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-06-30");
  const [format, setFormat] = useState<ExportFormat>("pdf");

  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (scope !== "global" && !targetId) {
      return alert("Please select a specific target entity for this scope.");
    }

    setIsGenerating(true);
    try {
      const payload: ReportGenerationRequest = {
        domain,
        scope,
        target_id: targetId ? parseInt(targetId) : undefined,
        date_from: dateFrom,
        date_to: dateTo,
        format,
      };

      const result = await adminReportsApi.generateReport(payload);
      onReportGenerated(result);
    } catch (error) {
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  const getTargetOptions = () => {
    if (scope === "global") return [];
    return (SCOPE_OPTIONS as any)[scope] || [];
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h2 className="text-lg font-bold text-slate-800 mb-6">
        Configure Report Parameters
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* LEFT COLUMN: Dimensions */}
        <div className="space-y-6">
          {/* 1. Domain Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              1. Report Domain (Data Type)
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "financial",
                  "occupancy",
                  "tenancy",
                  "property",
                  "marketplace",
                  "maintenance",
                  "application",
                  "communication",
                ] as ReportDomain[]
              ).map((d) => (
                <button
                  key={d}
                  onClick={() => setDomain(d)}
                  className={`py-2.5 px-3 rounded-lg border text-xs font-bold capitalize transition-all ${
                    domain === d
                      ? "bg-primary/5 border-primary text-primary ring-2 ring-primary/20"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Scope Selection (The "Every Level" Logic) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              2. Hierarchy Scope (Drill-Down Level)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {(
                [
                  "global",
                  "agency",
                  "landlord",
                  "property",
                  "tenant",
                ] as ReportScope[]
              ).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setScope(s);
                    setTargetId("");
                  }}
                  className={`py-2.5 px-2 rounded-lg border text-[10px] font-bold uppercase transition-all ${
                    scope === s
                      ? "bg-secondary/5 border-secondary text-secondary ring-2 ring-secondary/20"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Target Entity Selector (Conditional) */}
          {scope !== "global" && (
            <div className="animate-in fade-in slide-in-from-top-2">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                3. Select Target {scope}
              </label>
              <select
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none text-sm"
              >
                <option value="">-- Choose Specific {scope} --</option>
                {getTargetOptions().map((opt: any) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Filters & Export */}
        <div className="space-y-6">
          {/* 4. Date Range */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              4. Date Range
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

          {/* 5. Export Format */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              5. Export Format
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["pdf", "excel", "csv"] as ExportFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className={`py-3 rounded-lg border font-bold text-sm uppercase transition-all ${
                    format === f
                      ? "bg-green-50 border-green-500 text-green-700 ring-2 ring-green-200"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  {f === "excel" ? "Excel (XLSX)" : f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Summary & Generate */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mt-8">
            <p className="text-xs text-slate-500 mb-2 font-bold uppercase">
              Execution Summary
            </p>
            <p className="text-sm text-slate-800">
              Generating{" "}
              <span className="font-bold text-primary">{domain}</span> report
              for
              <span className="font-bold text-secondary">
                {" "}
                {scope === "global"
                  ? "the ENTIRE PLATFORM"
                  : `specific ${scope}`}
              </span>
              from {dateFrom} to {dateTo}.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-4 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Compiling Data & Generating Document...
              </>
            ) : (
              <>🚀 Generate & Export Report</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
