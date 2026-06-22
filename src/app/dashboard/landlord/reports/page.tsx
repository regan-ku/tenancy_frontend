"use client";

import React, { useState, useEffect } from "react";
import { reportsApi, ReportConfig } from "@/api/reports.api";

export default function LandlordReportsPage() {
  const [reports, setReports] = useState<ReportConfig[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [reportType, setReportType] = useState("rent_collection");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    reportsApi.getRecentReports().then(setReports);
  }, []);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const newReport = await reportsApi.generateReport(reportType, {
        month: "current",
      });
      setReports([newReport, ...reports]);
      setShowGenerator(false);
    } catch (error) {
      alert("Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Reports & Analytics
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Generate financial, occupancy, and performance reports for your
            portfolio.
          </p>
        </div>
        <button
          onClick={() => setShowGenerator(!showGenerator)}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90"
        >
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
              d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Generate New Report
        </button>
      </div>

      {/* Generator Panel */}
      {showGenerator && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-in fade-in slide-in-from-top-2">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Configure Report
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Report Type
              </label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="rent_collection">Rent Collection Summary</option>
                <option value="arrears">Outstanding Arrears</option>
                <option value="occupancy">Occupancy & Vacancy</option>
                <option value="property_performance">
                  Property Performance
                </option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                Date Range
              </label>
              <select className="w-full px-4 py-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-primary outline-none">
                <option>Current Month</option>
                <option>Last 3 Months</option>
                <option>Year to Date</option>
              </select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 bg-secondary text-white font-bold py-2.5 rounded-lg hover:bg-secondary/90 disabled:opacity-50"
              >
                {isGenerating ? "Generating..." : "Generate"}
              </button>
              <button
                onClick={() => setShowGenerator(false)}
                className="px-4 py-2.5 text-slate-500 font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Analytics (Pure CSS Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Income vs Arrears (Last 6 Months)
          </h2>
          <div className="h-64 flex items-end justify-between gap-4 px-2 pb-8 border-b border-slate-100 relative">
            {[
              { month: "Jan", income: 80, arrears: 20 },
              { month: "Feb", income: 85, arrears: 15 },
              { month: "Mar", income: 75, arrears: 25 },
              { month: "Apr", income: 90, arrears: 10 },
              { month: "May", income: 88, arrears: 12 },
              { month: "Jun", income: 95, arrears: 5 },
            ].map((data, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 h-full justify-end"
              >
                <div className="w-full flex gap-1 items-end h-full">
                  <div
                    className="flex-1 bg-green-500 rounded-t-md transition-all hover:bg-green-600"
                    style={{ height: `${data.income}%` }}
                    title={`Income: ${data.income}%`}
                  ></div>
                  <div
                    className="flex-1 bg-red-400 rounded-t-md transition-all hover:bg-red-500"
                    style={{ height: `${data.arrears}%` }}
                    title={`Arrears: ${data.arrears}%`}
                  ></div>
                </div>
                <span className="text-xs text-slate-500 font-medium mt-2">
                  {data.month}
                </span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 bg-green-500 rounded-sm"></span> Income
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="w-3 h-3 bg-red-400 rounded-sm"></span> Arrears
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-6">
            Portfolio Occupancy Rate
          </h2>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="12"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="12"
                  strokeDasharray="251.2"
                  strokeDashoffset="30"
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-extrabold text-primary-dark">
                  88%
                </span>
                <span className="text-xs text-slate-500 font-medium">
                  Occupied
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center mt-4">
            <div>
              <p className="text-2xl font-bold text-green-600">37</p>
              <p className="text-xs text-slate-500">Occupied</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">5</p>
              <p className="text-xs text-slate-500">Vacant</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">42</p>
              <p className="text-xs text-slate-500">Total Units</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">
            Generated Reports
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Report Title</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Generated Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 capitalize text-slate-600">
                    {report.type.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {report.generated_at}
                  </td>
                  <td className="px-6 py-4 text-right flex gap-2 justify-end">
                    <button
                      onClick={() =>
                        reportsApi.downloadReport(report.id, "pdf")
                      }
                      className="text-xs bg-red-50 text-red-600 px-3 py-1.5 rounded-lg font-bold hover:bg-red-100 flex items-center gap-1"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      PDF
                    </button>
                    <button
                      onClick={() =>
                        reportsApi.downloadReport(report.id, "excel")
                      }
                      className="text-xs bg-green-50 text-green-600 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100 flex items-center gap-1"
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
                          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      Excel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
