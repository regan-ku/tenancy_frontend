"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import {
  tenantDashboardApi,
  TenantKPIs,
  PersonalTenancy,
} from "@/api/tenantDashboard.api";

// ✅ Global formatter so sub-components can use it
const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

export default function TenantOverviewPage() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<TenantKPIs | null>(null);
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [kpiData, tenancyData] = await Promise.all([
        tenantDashboardApi.getTenantKPIs(),
        tenantDashboardApi.getMyPersonalTenancies(),
      ]);
      setKpis(kpiData);
      setTenancies(tenancyData);
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Welcome back, {(user as any)?.full_name?.split(" ")[0] || "Tenant"}!
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your active tenancies, track payments, and log maintenance
          requests across all your properties.
        </p>
      </div>

      {/* Aggregated KPI Cards (Sums up ALL tenancies) */}
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
              title="Active Tenancies"
              value={kpis?.active_tenancies_count || 0}
              icon="🏠"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Total Outstanding"
              value={formatCurrency(kpis?.total_outstanding_balance || 0)}
              icon="💰"
              color={
                kpis && kpis.total_outstanding_balance > 0
                  ? "bg-red-50 text-red-600"
                  : "bg-green-50 text-green-600"
              }
            />
            <KPICard
              title="Open Maintenance"
              value={kpis?.open_maintenance_requests || 0}
              icon="🛠️"
              color="bg-orange-50 text-orange-600"
            />
            <KPICard
              title="Next Billing Date"
              value={kpis?.next_billing_date || "N/A"}
              icon="📅"
              color="bg-purple-50 text-purple-600"
            />
          </>
        )}
      </div>

      {/* ✅ THE MULTI-TENANCY CONTEXT WIDGET */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              My Active Tenancies
            </h2>
            <p className="text-xs text-slate-500">
              Select a property to view specific financials, lease details, or
              log a maintenance issue.
            </p>
          </div>
          <Link
            href="/dashboard/tenant/tenancies"
            className="text-xs text-primary font-bold hover:underline"
          >
            View All History →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {loading
            ? Array(2)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-slate-100 animate-pulse rounded-2xl"
                  ></div>
                ))
            : tenancies.map((tenancy) => (
                <TenancyCard key={tenancy.id} tenancy={tenancy} />
              ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SHARED SUB-COMPONENTS
// ==========================================

// ✅ THIS COMPONENT WILL BE REUSED IN PHASE 5 FOR LANDLORDS/AGENCIES
export function TenancyCard({ tenancy }: { tenancy: PersonalTenancy }) {
  const hasBalance = tenancy.balance_due > 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Card Header */}
      <div className="p-5 border-b border-slate-100 flex justify-between items-start">
        <div>
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            {tenancy.property_name}
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            Unit {tenancy.unit_code} • {tenancy.unit_type}
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Managed by: {tenancy.landlord_or_agency_name}
          </p>
        </div>
        <span
          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
            tenancy.status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {tenancy.status.replace("_", " ")}
        </span>
      </div>

      {/* Card Body (Financials & Lease) */}
      <div className="p-5 grid grid-cols-2 gap-4 flex-1">
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Monthly Rent
          </p>
          <p className="text-xl font-extrabold text-primary-dark">
            {formatCurrency(tenancy.rent_amount)}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-slate-400 uppercase font-bold">
            Balance Due
          </p>
          <p
            className={`text-xl font-extrabold ${hasBalance ? "text-red-600" : "text-green-600"}`}
          >
            {formatCurrency(tenancy.balance_due)}
          </p>
        </div>
        <div className="col-span-2 pt-3 border-t border-slate-100 flex justify-between text-xs">
          <div>
            <p className="text-slate-400">Next Due Date</p>
            <p className="font-bold text-slate-700">
              {tenancy.next_billing_date}
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Lease Ends</p>
            <p className="font-bold text-slate-700">{tenancy.lease_end_date}</p>
          </div>
        </div>
      </div>

      {/* Card Footer (Scoped Quick Actions) */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 grid grid-cols-3 gap-2">
        <Link
          href={`/dashboard/tenant/payments?tenancy_id=${tenancy.id}`}
          className="text-center py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90"
        >
          Pay Rent
        </Link>
        <Link
          href={`/dashboard/tenant/maintenance/new?tenancy_id=${tenancy.id}`}
          className="text-center py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100"
        >
          Log Issue
        </Link>
        <Link
          href={`/dashboard/tenant/documents?tenancy_id=${tenancy.id}`}
          className="text-center py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-100"
        >
          View Lease
        </Link>
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
