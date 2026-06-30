"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
// import { reportsApi } from "@/api/reports.api"; // Uncomment when backend is wired

export default function AgentDashboard() {
  const { user } = useAuthStore();

  const [dashboardData, setDashboardData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // TODO: Replace with actual API call
        // const data = await reportsApi.getDashboard('agent');
        // setDashboardData(data);

        // Mock data representing the Agent Dashboard Contract
        setDashboardData({
          kpis: {
            assigned_properties: 8,
            pending_applications: 3, // Applications this agent needs to review/approve
            active_viewings: 5,
            active_leads: 24,
          },
          viewings: [
            {
              id: 1,
              time: "10:00 AM",
              client: "John Doe",
              property: "Kilimani Heights, Unit B-204",
              status: "confirmed",
            },
            {
              id: 2,
              time: "11:30 AM",
              client: "Alice Smith",
              property: "Westlands Plaza, Shop 1",
              status: "pending",
            },
            {
              id: 3,
              time: "02:00 PM",
              client: "Mike Ross",
              property: "Lavington Villas, V-02",
              status: "confirmed",
            },
          ],
          leads: [
            {
              id: 1,
              name: "Sarah Connor",
              interest: "2 Bedroom Apartment",
              source: "Marketplace",
            },
            {
              id: 2,
              name: "Bruce Wayne",
              interest: "Commercial Office",
              source: "Referral",
            },
          ],
          targets: {
            current: 7,
            goal: 10,
          },
        });
      } catch (error) {
        console.error("Failed to fetch agent dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading your pipeline...</p>
        </div>
      </div>
    );
  }

  const { kpis, viewings, leads, targets } = dashboardData;
  const targetPercentage = Math.round((targets.current / targets.goal) * 100);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Welcome, {(user as any)?.full_name?.split(" ")[0] || "Agent"}!
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Here is your sales pipeline and viewing schedule for today.
          </p>
        </div>
        <Link
          href="/dashboard/agent/viewings/new"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
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
          Log New Viewing
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Assigned Properties"
          value={kpis.assigned_properties}
          icon="🏢"
          color="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Pending Applications"
          value={kpis.pending_applications}
          icon="📝"
          color="bg-green-50 text-green-600"
          subtitle="Awaiting your review"
        />
        <KPICard
          title="Viewings Today"
          value={kpis.active_viewings}
          icon="📅"
          color="bg-orange-50 text-orange-600"
        />
        <KPICard
          title="Active Leads"
          value={kpis.active_leads}
          icon="👥"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Viewings & Leads */}
        <div className="lg:col-span-2 space-y-8">
          {/* Today's Viewings */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Today's Viewings Schedule
              </h2>
              <Link
                href="/dashboard/agent/viewings"
                className="text-xs text-primary font-bold hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="space-y-3">
              {viewings.length > 0 ? (
                viewings.map((viewing: any) => (
                  <ViewingRow key={viewing.id} {...viewing} />
                ))
              ) : (
                <p className="text-center text-slate-400 py-6">
                  No viewings scheduled for today.
                </p>
              )}
            </div>
          </div>

          {/* Recent Leads */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-800">
                Recent Leads & Inquiries
              </h2>
              <Link
                href="/dashboard/agent/leads"
                className="text-xs text-primary font-bold hover:underline"
              >
                Manage Leads →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-4 py-3">Lead Name</th>
                    <th className="px-4 py-3">Interest</th>
                    <th className="px-4 py-3">Source</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.length > 0 ? (
                    leads.map((lead: any) => (
                      <tr key={lead.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-bold text-slate-800">
                          {lead.name}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {lead.interest}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs px-2 py-0.5 rounded font-bold ${
                              lead.source === "Marketplace"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-purple-100 text-purple-700"
                            }`}
                          >
                            {lead.source}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/agent/leads/${lead.id}`}
                            className="text-xs text-primary font-bold hover:underline"
                          >
                            Contact
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-6 text-center text-slate-400"
                      >
                        No recent leads.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Quick Actions & Targets */}
        <div className="space-y-8">
          {/* Monthly Target */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Monthly Target
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Applications Approved</span>
                <span className="font-bold text-primary-dark">
                  {targets.current} / {targets.goal}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${targetPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {targets.goal - targets.current} more approvals needed to hit
                your monthly bonus tier.
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-800 mb-4">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link href="/dashboard/agent/leads" className="block">
                <QuickActionBtn icon="📞" label="Contact a Lead" />
              </Link>
              <Link href="/dashboard/agent/viewings/new" className="block">
                <QuickActionBtn icon="📅" label="Schedule Viewing" />
              </Link>
              <Link href="/dashboard/agent/applications" className="block">
                <QuickActionBtn icon="📝" label="Review Applications" />
              </Link>
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

function KPICard({ title, value, icon, color, subtitle }: any) {
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
      <div className="flex items-end gap-2 mt-1">
        <p className="text-2xl font-extrabold text-primary-dark">{value}</p>
        {subtitle && <p className="text-xs text-slate-400 mb-1">{subtitle}</p>}
      </div>
    </div>
  );
}

function ViewingRow({ time, client, property, status }: any) {
  return (
    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <div className="flex items-center gap-4">
        <div className="text-center min-w-[60px]">
          <p className="text-xs font-bold text-primary">{time}</p>
        </div>
        <div>
          <p className="font-bold text-slate-800 text-sm">{client}</p>
          <p className="text-xs text-slate-500">{property}</p>
        </div>
      </div>
      <span
        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
          status === "confirmed"
            ? "bg-green-100 text-green-700"
            : "bg-yellow-100 text-yellow-700"
        }`}
      >
        {status}
      </span>
    </div>
  );
}

function QuickActionBtn({ icon, label }: any) {
  return (
    <div className="w-full flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left cursor-pointer">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-slate-700">{label}</span>
    </div>
  );
}
