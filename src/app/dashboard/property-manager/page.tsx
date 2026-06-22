"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

export default function PropertyManagerDashboard() {
  const { user } = useAuthStore();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Portfolio Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome, {(user as any)?.full_name?.split(" ")[0] || "Manager"}.
            Overseeing your assigned delegated properties.
          </p>
        </div>
        <Link
          href="/dashboard/property-manager/tenancies"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add New Tenant
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Managed Units"
          value="142"
          icon="🚪"
          color="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Occupancy Rate"
          value="94%"
          icon="📈"
          color="bg-green-50 text-green-600"
        />
        <KPICard
          title="Rent Collected (Month)"
          value="KES 2.1M"
          icon="💰"
          color="bg-purple-50 text-purple-600"
        />
        <KPICard
          title="Open Maintenance"
          value="7"
          icon="🛠️"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Operations */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Operational Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                href="/dashboard/property-manager/applications"
                label="Review Applications"
                icon="✅"
              />
              <QuickAction
                href="/dashboard/property-manager/tenancies"
                label="Manage Leases"
                icon="📄"
              />
              <QuickAction
                href="/dashboard/property-manager/maintenance"
                label="Dispatch Caretaker"
                icon="🛠️"
              />
              <QuickAction
                href="/dashboard/property-manager/properties"
                label="Property Settings"
                icon="⚙️"
              />
            </div>
          </div>

          {/* Pending Approvals Queue */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Pending Approvals Queue
              </h2>
              <Link
                href="/dashboard/property-manager/applications"
                className="text-xs text-primary font-bold hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              <ApprovalRow
                type="Rental Application"
                applicant="David Miller"
                unit="Kilimani Heights, B-204"
                urgency="normal"
              />
              <ApprovalRow
                type="Transfer Request"
                applicant="Sarah Connor"
                unit="Lavington Villas, V-02"
                urgency="high"
              />
              <ApprovalRow
                type="Maintenance Escalation"
                applicant="James Mwangi (Caretaker)"
                unit="Westlands Plaza, Shop 1"
                urgency="high"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Staff & Activity */}
        <div className="space-y-8">
          {/* Staff Oversight */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              My Team's Workload
            </h2>
            <div className="space-y-3">
              <StaffRow
                name="Alice (Agent)"
                tasks={12}
                status="High"
                color="bg-red-500"
              />
              <StaffRow
                name="James (Caretaker)"
                tasks={5}
                status="Normal"
                color="bg-green-500"
              />
            </div>
            <Link
              href="/dashboard/agency/staff"
              className="block text-center text-xs text-primary font-bold mt-4 hover:underline"
            >
              Manage Staff →
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              <ActivityItem
                type="payment"
                message="KES 45,000 collected for Westlands Plaza"
                time="15 mins ago"
              />
              <ActivityItem
                type="maintenance"
                message="Emergency leak resolved in Unit A-101"
                time="2 hours ago"
              />
              <ActivityItem
                type="tenancy"
                message="Lease renewed for Unit C-301"
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

function ApprovalRow({ type, applicant, unit, urgency }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`w-2 h-10 rounded-full ${urgency === "high" ? "bg-red-500" : "bg-blue-500"}`}
        ></div>
        <div>
          <p className="text-sm font-bold text-slate-800">{type}</p>
          <p className="text-xs text-slate-500">
            {applicant} • {unit}
          </p>
        </div>
      </div>
      <button className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90">
        Review
      </button>
    </div>
  );
}

function StaffRow({ name, tasks, status, color }: any) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-2 h-8 rounded-full ${color}`}></div>
        <p className="text-sm font-bold text-slate-800">{name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-extrabold text-primary-dark">
          {tasks}{" "}
          <span className="text-xs font-medium text-slate-400">tasks</span>
        </p>
      </div>
    </div>
  );
}

function ActivityItem({ type, message, time }: any) {
  const colors: any = {
    payment: "bg-green-100 text-green-600",
    maintenance: "bg-orange-100 text-orange-600",
    tenancy: "bg-purple-100 text-purple-600",
  };
  const icons: any = { payment: "💰", maintenance: "🛠️", tenancy: "📄" };

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
