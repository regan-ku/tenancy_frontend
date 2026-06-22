"use client";

import React, { useState, useEffect } from "react";
import {
  agencyIntelligenceApi,
  PortfolioMetric,
  MaintenanceAnalytics,
  LandlordStatement,
} from "@/api/agencyIntelligence.api";

export default function AgencyReportsPage() {
  const [metrics, setMetrics] = useState<PortfolioMetric[]>([]);
  const [maintAnalytics, setMaintAnalytics] =
    useState<MaintenanceAnalytics | null>(null);
  const [statements, setStatements] = useState<LandlordStatement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "portfolio" | "operations" | "statements"
  >("portfolio");

  useEffect(() => {
    const fetchData = async () => {
      const [m, ma, s] = await Promise.all([
        agencyIntelligenceApi.getPortfolioMetrics(),
        agencyIntelligenceApi.getMaintenanceAnalytics(),
        agencyIntelligenceApi.getLandlordStatements(),
      ]);
      setMetrics(m);
      setMaintAnalytics(ma);
      setStatements(s);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // Calculate aggregates
  const totalUnits = metrics.reduce((acc, m) => acc + m.total_units, 0);
  const avgOccupancy =
    metrics.length > 0
      ? Math.round(
          metrics.reduce((acc, m) => acc + m.occupancy_rate, 0) /
            metrics.length,
        )
      : 0;
  const totalCollected = metrics.reduce((acc, m) => acc + m.rent_collected, 0);
  const totalArrears = metrics.reduce((acc, m) => acc + m.arrears, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Reports & Intelligence
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Read-only analytics across your delegated portfolio. Generate
            statements and track operational SLAs.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90">
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
          Export All Data (Excel)
        </button>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Managed Units"
          value={totalUnits}
          icon="🚪"
          color="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Avg. Occupancy Rate"
          value={`${avgOccupancy}%`}
          icon="📈"
          color="bg-green-50 text-green-600"
        />
        <KPICard
          title="Total Rent Collected"
          value={formatCurrency(totalCollected)}
          icon="💰"
          color="bg-purple-50 text-purple-600"
        />
        <KPICard
          title="Total Portfolio Arrears"
          value={formatCurrency(totalArrears)}
          icon="⚠️"
          color="bg-red-50 text-red-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "portfolio", label: "Property Performance" },
            { key: "operations", label: "Maintenance & SLAs" },
            { key: "statements", label: "Landlord Statements" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
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
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Property & Landlord</th>
                  <th className="px-6 py-4">Units & Occupancy</th>
                  <th className="px-6 py-4">Rent Collected</th>
                  <th className="px-6 py-4">Arrears</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {metrics.map((m, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {m.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Owner: {m.landlord_name}
                      </p>
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
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs text-primary hover:underline font-bold">
                        View Ledger →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* OPERATIONS TAB */}
        {activeTab === "operations" && maintAnalytics && (
          <div className="p-8 space-y-8">
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

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-800">
              <strong>Operational Insight:</strong> Your caretaker team is
              resolving{" "}
              {Math.round(
                (maintAnalytics.resolved_within_sla /
                  maintAnalytics.total_requests) *
                  100,
              )}
              % of issues within the SLA. Consider dispatching additional field
              staff to reduce the {maintAnalytics.breached_sla} breached
              tickets.
            </div>
          </div>
        )}

        {/* STATEMENTS TAB */}
        {activeTab === "statements" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Landlord</th>
                  <th className="px-6 py-4">Period</th>
                  <th className="px-6 py-4">Gross Rent</th>
                  <th className="px-6 py-4">Agency Fee (10%)</th>
                  <th className="px-6 py-4">Net Payout</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {statements.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {s.landlord_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{s.period}</td>
                    <td className="px-6 py-4 text-slate-700">
                      {formatCurrency(s.gross_rent)}
                    </td>
                    <td className="px-6 py-4 text-red-600 font-medium">
                      - {formatCurrency(s.agency_fee)}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-green-600">
                      {formatCurrency(s.net_payout)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90 flex items-center gap-1 ml-auto">
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
                        Download PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

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
