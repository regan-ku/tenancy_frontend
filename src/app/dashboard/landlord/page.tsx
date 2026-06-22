"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { dashboardApi, DashboardKPIs } from "@/api/dashboard.api";
import { useAuthStore } from "@/store/auth.store";

export default function LandlordOverviewPage() {
  const { user } = useAuthStore();
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getKPIs().then((data) => {
      setKpis(data);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Welcome back,{" "}
            {(user as any)?.full_name?.split(" ")[0] || "Landlord"}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here is what is happening with your properties today.
          </p>
        </div>
        <Link
          href="/properties/wizard"
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
          Add New Property
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
              title="Total Properties"
              value={kpis?.total_properties || 0}
              icon="🏢"
              color="bg-blue-50 text-blue-600"
            />
            <KPICard
              title="Occupancy Rate"
              value={`${kpis?.occupancy_rate || 0}%`}
              icon="📈"
              color="bg-green-50 text-green-600"
              trend="+2.5%"
            />
            <KPICard
              title="Rent Collected"
              value={formatCurrency(kpis?.rent_collected || 0)}
              icon="💰"
              color="bg-purple-50 text-purple-600"
            />
            <KPICard
              title="Outstanding Arrears"
              value={formatCurrency(kpis?.outstanding_arrears || 0)}
              icon="⚠️"
              color="bg-red-50 text-red-600"
            />
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* ✅ UPDATED QUICK ACTIONS: Now points to the real pages we built */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <QuickAction
                href="/dashboard/landlord/tenants"
                label="Add Tenant"
                icon="👤"
              />
              <QuickAction
                href="/dashboard/landlord/payments"
                label="Request Payment"
                icon="💳"
              />
              <QuickAction
                href="/dashboard/landlord/operations"
                label="Review Applications"
                icon="📝"
              />
              <QuickAction
                href="/dashboard/landlord/communications"
                label="Send Broadcast"
                icon="📢"
              />
            </div>
          </div>

          {/* Rent Collection Chart Placeholder */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Rent Collection (Last 6 Months)
            </h2>
            <div className="h-64 flex items-end justify-between gap-4 px-4 pb-8 border-b border-slate-100">
              {[65, 80, 45, 90, 75, 95].map((height, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full bg-primary/20 rounded-t-lg relative overflow-hidden"
                    style={{ height: `${height}%` }}
                  >
                    <div
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg"
                      style={{ height: `${height * 0.8}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Recent Activity */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Recent Activity
          </h2>
          <div className="space-y-4">
            <ActivityItem
              type="payment"
              message="KES 15,000 received for Unit A-101"
              time="2 mins ago"
            />
            <ActivityItem
              type="application"
              message="New rental application for Unit B-204"
              time="1 hour ago"
            />
            <ActivityItem
              type="maintenance"
              message="Plumbing issue reported in Unit C-302"
              time="3 hours ago"
            />
            <ActivityItem
              type="tenancy"
              message="Lease agreement signed for Unit A-105"
              time="Yesterday"
            />
            <ActivityItem
              type="payment"
              message="KES 30,000 received for Commercial Shop 2"
              time="2 days ago"
            />
          </div>
          <Link
            href="/dashboard/landlord/communications"
            className="block text-center text-sm text-primary font-medium mt-6 hover:underline"
          >
            View All Activity
          </Link>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function KPICard({ title, value, icon, color, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${color}`}
        >
          {icon}
        </div>
        {trend && (
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
            {trend}
          </span>
        )}
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

function ActivityItem({ type, message, time }: any) {
  const colors: any = {
    payment: "bg-green-100 text-green-600",
    application: "bg-blue-100 text-blue-600",
    maintenance: "bg-orange-100 text-orange-600",
    tenancy: "bg-purple-100 text-purple-600",
  };
  const icons: any = {
    payment: "💰",
    application: "📝",
    maintenance: "🛠️",
    tenancy: "🏠",
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
