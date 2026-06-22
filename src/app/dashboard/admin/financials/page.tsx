"use client";

import React, { useState, useEffect } from "react";
import {
  adminFinancialsApi,
  PlatformFinancialKPIs,
  PropertyFinancialRecord,
} from "@/api/adminFInancials.api";
import PlatformTransactionLedger from "@/components/admin/PlatformTransactionLedger";

export default function AdminFinancialsPage() {
  const [kpis, setKpis] = useState<PlatformFinancialKPIs | null>(null);
  const [properties, setProperties] = useState<PropertyFinancialRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "property_financials" | "transaction_ledger"
  >("property_financials");

  // ✅ FILTER STATES
  const [filterManager, setFilterManager] = useState<string>("all"); // "all", "self_managed", or specific agency name
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const [kpiData, propData] = await Promise.all([
        adminFinancialsApi.getPlatformKPIs(),
        adminFinancialsApi.getPropertyFinancials(),
      ]);
      setKpis(kpiData);
      setProperties(propData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  // ✅ Get unique agencies for the filter dropdown
  const uniqueAgencies = Array.from(
    new Set(properties.map((p) => p.manager_agency_name).filter(Boolean)),
  ) as string[];

  // ✅ FILTER LOGIC
  const filteredProperties = properties.filter((p) => {
    const matchesSearch =
      p.property_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner_name.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesManager = true;
    if (filterManager === "self_managed")
      matchesManager = p.manager_agency_name === null;
    else if (filterManager !== "all")
      matchesManager = p.manager_agency_name === filterManager;

    return matchesSearch && matchesManager;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      compliant: "bg-green-100 text-green-700",
      account_pending: "bg-yellow-100 text-yellow-700",
      disputed: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Financial Oversight & Routing
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor platform-wide transaction volumes, property-level financial
          routing, and payment account compliance.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-28 bg-slate-100 animate-pulse rounded-2xl"
              ></div>
            ))
        ) : (
          <>
            <KPICard
              title="Platform Volume (Month)"
              value={formatCurrency(kpis?.total_platform_volume || 0)}
              icon="💰"
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Verified Accounts"
              value={kpis?.verified_payment_accounts || 0}
              icon="✅"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Pending Verifications"
              value={kpis?.pending_account_verifications || 0}
              icon="⏳"
              color="bg-yellow-50 text-yellow-600"
            />
            <KPICard
              title="Active Disputes"
              value={kpis?.active_disputes || 0}
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
            {
              key: "property_financials",
              label: "Property Financials & Routing",
            },
            { key: "transaction_ledger", label: "Master Transaction Ledger" },
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
      {activeTab === "property_financials" && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                placeholder="Search property or owner..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <select
              value={filterManager}
              onChange={(e) => setFilterManager(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
            >
              <option value="all">All Management Types</option>
              <option value="self_managed">
                Self-Managed (Landlord Direct)
              </option>
              {uniqueAgencies.map((agency) => (
                <option key={agency} value={agency}>
                  Managed by: {agency}
                </option>
              ))}
            </select>
          </div>

          {/* Property Financials Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Property & Ownership</th>
                  <th className="px-6 py-4">Management & Routing</th>
                  <th className="px-6 py-4">Destination Account</th>
                  <th className="px-6 py-4">Volume (Month)</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((prop) => (
                  <tr
                    key={prop.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {prop.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {prop.property_location}
                      </p>
                      <p className="text-xs text-primary font-bold mt-1">
                        Owner: {prop.owner_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {prop.manager_agency_name ? (
                        <div>
                          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded uppercase">
                            Agency Managed
                          </span>
                          <p className="text-xs text-slate-600 mt-1 font-medium">
                            {prop.manager_agency_name}
                          </p>
                        </div>
                      ) : (
                        <div>
                          <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">
                            Self-Managed
                          </span>
                          <p className="text-xs text-slate-500 mt-1">
                            Direct to Landlord
                          </p>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-mono font-bold text-slate-700">
                        {prop.collection_account_number}
                      </p>
                      <p className="text-[10px] text-slate-400 uppercase mt-0.5">
                        {prop.collection_route.replace("_", " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-extrabold text-primary-dark">
                        {formatCurrency(prop.total_collected_month)}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Fee: {formatCurrency(prop.platform_fee_generated)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(prop.status)}`}
                      >
                        {prop.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "transaction_ledger" && <PlatformTransactionLedger />}
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
