"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

// Mock Data for Agency KPIs (Will be replaced by GET /api/reports/dashboard/)
const mockAgencyKPIs = {
  properties_managed: 12,
  total_units: 340,
  rent_collected_month: 4500000,
  pending_applications: 8,
};

export default function AgencyOverviewPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch for Agency Dashboard Contract
    setTimeout(() => setLoading(false), 800);
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Agency Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back,{" "}
            {(user as any)?.full_name?.split(" ")[0] || "Agency Admin"}.
            Overseeing {mockAgencyKPIs.properties_managed} properties and{" "}
            {mockAgencyKPIs.total_units} units.
          </p>
        </div>
        <Link
          href="/dashboard/agency/delegations"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          View Delegations
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-32 bg-slate-100 animate-pulse rounded-2xl"
              ></div>
            ))
        ) : (
          <>
            <KPICard
              title="Properties Managed"
              value={mockAgencyKPIs.properties_managed}
              icon="🏢"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Total Units"
              value={mockAgencyKPIs.total_units}
              icon="🚪"
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Rent Collected (Month)"
              value={formatCurrency(mockAgencyKPIs.rent_collected_month)}
              icon="💰"
              color="bg-green-50 text-green-600"
            />
            <KPICard
              title="Pending Applications"
              value={mockAgencyKPIs.pending_applications}
              icon="📝"
              color="bg-orange-50 text-orange-600"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Operations & Quick Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Operational Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                href="/dashboard/agency/operations"
                label="Review Applications"
                icon="✅"
              />
              <QuickAction
                href="/dashboard/agency/payments"
                label="Reconcile Rent"
                icon="🧾"
              />
              <QuickAction
                href="/dashboard/agency/maintenance"
                label="Dispatch Caretakers"
                icon="🛠️"
              />
              <QuickAction
                href="/dashboard/agency/reports"
                label="Landlord Reports"
                icon="📊"
              />
            </div>
          </div>

          {/* Staff Workload & Performance (UNIQUE AGENCY FEATURE) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Staff Workload Overview
              </h2>
              <Link
                href="/dashboard/agency/staff"
                className="text-xs text-primary font-bold hover:underline"
              >
                Manage Staff →
              </Link>
            </div>
            <div className="space-y-4">
              <StaffWorkloadRow
                name="Alice Agent"
                role="Field Agent"
                tasks={12}
                status="High"
                color="bg-red-500"
              />
              <StaffWorkloadRow
                name="Bob Manager"
                role="Property Manager"
                tasks={5}
                status="Normal"
                color="bg-green-500"
              />
              <StaffWorkloadRow
                name="James Mwangi"
                role="Caretaker"
                tasks={8}
                status="Normal"
                color="bg-blue-500"
              />
              <StaffWorkloadRow
                name="Sarah Care"
                role="Caretaker"
                tasks={2}
                status="Low"
                color="bg-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Alerts & Compliance */}
        <div className="space-y-8">
          {/* Compliance Alert */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Compliance & Verification
            </h2>
            <div className="p-4 bg-green-50 border border-green-100 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-bold text-green-800">
                  Agency Fully Verified
                </p>
                <p className="text-xs text-green-700 mt-1">
                  All directors verified. Operational permissions active.
                </p>
              </div>
            </div>
            <button className="w-full mt-4 text-xs text-primary font-bold text-center hover:underline">
              Manage Directors & Documents →
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <ActivityItem
                type="payment"
                message="KES 150,000 collected for Myles Apts"
                time="10 mins ago"
              />
              <ActivityItem
                type="application"
                message="New rental application for Unit B-204"
                time="1 hour ago"
              />
              <ActivityItem
                type="maintenance"
                message="Emergency leak reported at Westlands Plaza"
                time="2 hours ago"
              />
              <ActivityItem
                type="system"
                message="Monthly landlord report generated"
                time="Yesterday"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function KPICard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-sm text-slate-500 font-medium">{title}</p>
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}

function QuickAction({ href, label, icon }: any) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center justify-center p-4 bg-slate-50 hover:bg-primary/5 border border-slate-100 hover:border-primary/20 rounded-xl transition-all group"
    >
      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
        {icon}
      </span>
      <span className="text-xs font-bold text-slate-700 group-hover:text-primary text-center">
        {label}
      </span>
    </Link>
  );
}

function StaffWorkloadRow({ name, role, tasks, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-8 rounded-full ${color}`}></div>
        <div>
          <p className="text-sm font-bold text-slate-800">{name}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-primary-dark">
          {tasks}{" "}
          <span className="text-xs font-medium text-slate-400">tasks</span>
        </p>
        <p
          className={`text-[10px] font-bold uppercase ${status === "High" ? "text-red-600" : status === "Low" ? "text-slate-400" : "text-green-600"}`}
        >
          {status} Load
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ type, message, time }: any) {
  const colors: any = {
    payment: "bg-green-100 text-green-600",
    application: "bg-blue-100 text-blue-600",
    maintenance: "bg-orange-100 text-orange-600",
    system: "bg-purple-100 text-purple-600",
  };
  const icons: any = {
    payment: "💰",
    application: "📝",
    maintenance: "🛠️",
    system: "⚙️",
  };

  return (
    <div className="flex items-start gap-3">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 ${colors[type]}`}
      >
        {icons[type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-800 leading-snug">{message}</p>
        <p className="text-xs text-slate-400 mt-1">{time}</p>
      </div>
    </div>
  );
}
