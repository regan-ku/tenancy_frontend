"use client";

import React, { useState, useEffect } from "react";
import { operationsApi } from "@/api/operations.api";
import OperationsBoard from "@/components/landlord/OperationsBoard";

export default function LandlordOperationsPage() {
  const [activeTab, setActiveTab] = useState<
    "applications" | "notices" | "maintenance"
  >("applications");
  const [stats, setStats] = useState({
    pendingApps: 0,
    pendingNotices: 0,
    openTickets: 0,
    emergencies: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [apps, notices, tickets] = await Promise.all([
          operationsApi.getApplications("rental"),
          operationsApi.getTerminations(),
          operationsApi.getMaintenanceTickets(),
        ]);

        setStats({
          pendingApps: apps.filter((a: any) => a.status === "pending").length,
          pendingNotices: notices.filter((n) => n.status === "pending_review")
            .length,
          openTickets: tickets.filter(
            (t) => t.status !== "closed" && t.status !== "resolved",
          ).length,
          emergencies: tickets.filter(
            (t) => t.priority === "emergency" && t.status !== "closed",
          ).length,
        });
      } catch (error) {
        console.error("Failed to load operations stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Operations & Approvals
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage rental applications, transfer requests, move-out notices, and
          maintenance tickets.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Pending Applications"
          value={stats.pendingApps}
          icon="📝"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Move-Out Notices"
          value={stats.pendingNotices}
          icon="📦"
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          title="Open Maintenance"
          value={stats.openTickets}
          icon="🛠️"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Emergencies"
          value={stats.emergencies}
          icon="🚨"
          color="bg-red-50 text-red-600"
          pulse={stats.emergencies > 0}
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "applications", label: "Applications & Transfers" },
            { key: "notices", label: "Notices & Terminations" },
            { key: "maintenance", label: "Maintenance Board" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.key
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Board Content */}
      <OperationsBoard activeTab={activeTab} />
    </div>
  );
}

function StatCard({ title, value, icon, color, pulse }: any) {
  return (
    <div
      className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 relative ${pulse ? "ring-2 ring-red-200" : ""}`}
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
        </span>
      )}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3 ${color}`}
      >
        {icon}
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}
