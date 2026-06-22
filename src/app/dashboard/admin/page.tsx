"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";

// Mock Data for System KPIs
const mockSystemKPIs = {
  total_users: 14520,
  active_properties: 840,
  pending_verifications: 14,
  platform_revenue_month: 1250000,
  active_listings: 1205,
  open_disputes: 3,
};

export default function AdminOverviewPage() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API fetch for System Dashboard Contract
    setTimeout(() => setLoading(false), 800);
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            System Command Center
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Welcome back, {(user as any)?.full_name || "Admin"}. Platform health
            and governance overview.
          </p>
        </div>
        <Link
          href="/dashboard/admin/verifications"
          className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-5 rounded-lg shadow-md transition-all"
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
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Review Verifications ({mockSystemKPIs.pending_verifications})
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
              title="Total Registered Users"
              value={mockSystemKPIs.total_users.toLocaleString()}
              icon="👥"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Active Properties"
              value={mockSystemKPIs.active_properties.toLocaleString()}
              icon="🏢"
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Pending Verifications"
              value={mockSystemKPIs.pending_verifications}
              icon="🛡️"
              color="bg-red-50 text-red-600"
              pulse={mockSystemKPIs.pending_verifications > 0}
            />
            <KPICard
              title="Platform Revenue (Month)"
              value={formatCurrency(mockSystemKPIs.platform_revenue_month)}
              icon="💰"
              color="bg-green-50 text-green-600"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: System Health & Actions */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Platform Governance Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                href="/dashboard/admin/verifications"
                label="Verify Landlords"
                icon="🏠"
              />
              <QuickAction
                href="/dashboard/admin/verifications"
                label="Verify Agencies"
                icon="🏢"
              />
              <QuickAction
                href="/dashboard/admin/financials"
                label="Approve Paybills"
                icon="📱"
              />
              <QuickAction
                href="/dashboard/admin/marketplace"
                label="Moderate Listings"
                icon="🛒"
              />
            </div>
          </div>

          {/* System Health / Bottlenecks */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                System Bottlenecks & Alerts
              </h2>
              <Link
                href="/dashboard/admin/audit"
                className="text-xs text-primary font-bold hover:underline"
              >
                View Audit Logs →
              </Link>
            </div>
            <div className="space-y-4">
              <AlertRow
                type="verification"
                title="14 Users Awaiting Document Verification"
                desc="Includes 3 Agencies and 11 Landlords. Oldest request: 2 days ago."
                urgency="high"
              />
              <AlertRow
                type="financial"
                title="5 Payment Accounts Pending Admin Review"
                desc="New Paybill/Till numbers submitted for rent collection routing."
                urgency="medium"
              />
              <AlertRow
                type="dispute"
                title="3 Open Tenant-Landlord Disputes"
                desc="Requires mediation or system intervention."
                urgency="high"
              />
              <AlertRow
                type="system"
                title="Nightly Report Generation Successful"
                desc="All financial and occupancy reports generated at 02:00 AM."
                urgency="low"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Platform Stats */}
        <div className="space-y-8">
          {/* Marketplace Stats */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Marketplace Health
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Active Listings</span>
                <span className="text-lg font-extrabold text-primary-dark">
                  {mockSystemKPIs.active_listings}
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">
                  Featured Properties
                </span>
                <span className="text-lg font-extrabold text-primary-dark">
                  24
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <span className="text-sm text-slate-500">Hidden/Flagged</span>
                <span className="text-lg font-extrabold text-red-600">8</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Open Disputes</span>
                <span className="text-lg font-extrabold text-orange-600">
                  {mockSystemKPIs.open_disputes}
                </span>
              </div>
            </div>
          </div>

          {/* User Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              User Distribution
            </h2>
            <div className="space-y-3">
              <RoleBar
                label="Tenants"
                count={12000}
                total={14520}
                color="bg-blue-500"
              />
              <RoleBar
                label="Landlords"
                count={2100}
                total={14520}
                color="bg-green-500"
              />
              <RoleBar
                label="Agencies"
                count={150}
                total={14520}
                color="bg-purple-500"
              />
              <RoleBar
                label="Staff (Agents/Caretakers)"
                count={270}
                total={14520}
                color="bg-orange-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ✅ SUB-COMPONENTS (FULLY TYPED TO PREVENT TS ERRORS)
// ==========================================

interface KPICardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  pulse?: boolean;
}

function KPICard({ title, value, icon, color, pulse }: KPICardProps) {
  return (
    <div
      className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow relative ${pulse ? "ring-2 ring-red-200" : ""}`}
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
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

interface QuickActionProps {
  href: string;
  label: string;
  icon: string;
}

function QuickAction({ href, label, icon }: QuickActionProps) {
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

// ✅ FIX: Explicitly typed props and Record<string, string> for dictionaries
interface AlertRowProps {
  type: string;
  title: string;
  desc: string;
  urgency: string;
}

function AlertRow({ type, title, desc, urgency }: AlertRowProps) {
  const colors: Record<string, string> = {
    high: "bg-red-50 border-red-100 text-red-700",
    medium: "bg-yellow-50 border-yellow-100 text-yellow-700",
    low: "bg-blue-50 border-blue-100 text-blue-700",
  };
  const icons: Record<string, string> = {
    verification: "🛡️",
    financial: "💰",
    dispute: "⚖️",
    system: "⚙️",
  };

  return (
    <div
      className={`flex items-start gap-4 p-4 rounded-xl border ${colors[urgency] || colors.low}`}
    >
      <div className="text-2xl">{icons[type] || "🔔"}</div>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs opacity-80 mt-1">{desc}</p>
      </div>
      <button className="text-xs font-bold bg-white/50 px-3 py-1.5 rounded-lg hover:bg-white transition-colors whitespace-nowrap">
        Resolve
      </button>
    </div>
  );
}

interface RoleBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function RoleBar({ label, count, total, color }: RoleBarProps) {
  const percentage = Math.round((count / total) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-bold text-slate-700">{label}</span>
        <span className="text-slate-500">
          {count.toLocaleString()} ({percentage}%)
        </span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2">
        <div
          className={`${color} h-2 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
