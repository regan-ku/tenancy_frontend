"use client";

import React, { useState, useEffect } from "react";
import {
  adminPlatformApi,
  SystemHealthMetrics,
  PlatformConfig,
  AdminAccount,
} from "@/api/adminPlatform.api";
import IntegrationHealthPanel from "@/components/admin/IntegrationHealthPanel";

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<
    "health" | "integrations" | "configs" | "admins"
  >("health");

  const [health, setHealth] = useState<SystemHealthMetrics | null>(null);
  const [configs, setConfigs] = useState<PlatformConfig[]>([]);
  const [admins, setAdmins] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [h, c, a] = await Promise.all([
        adminPlatformApi.getSystemHealth(),
        adminPlatformApi.getPlatformConfigs(),
        adminPlatformApi.getAdminAccounts(),
      ]);
      setHealth(h);
      setConfigs(c);
      setAdmins(a);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleToggleConfig = async (
    configId: string,
    currentStatus: boolean,
  ) => {
    const newStatus = !currentStatus;
    if (configId === "maintenance_mode" && newStatus) {
      if (
        !confirm(
          "⚠️ WARNING: Enabling Maintenance Mode will lock out ALL public users. Continue?",
        )
      )
        return;
    }

    await adminPlatformApi.updateConfig(configId, newStatus);
    setConfigs(
      configs.map((c) =>
        c.id === configId ? { ...c, is_enabled: newStatus } : c,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Platform Settings & System Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor server health, manage third-party integrations, control global
          feature toggles, and administer system accounts.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { key: "health", label: "System Health" },
            { key: "integrations", label: "Integrations & APIs" },
            { key: "configs", label: "Platform Configurations" },
            { key: "admins", label: "Admin Accounts" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {/* 1. SYSTEM HEALTH */}
        {activeTab === "health" && health && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm font-bold text-green-800">
                All Systems Operational
              </p>
              <span className="text-xs text-green-600 ml-auto">
                Last checked: Just now
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <HealthCard
                title="CPU Usage"
                value={`${health.cpu_usage}%`}
                percentage={health.cpu_usage}
                color="blue"
              />
              <HealthCard
                title="Memory (RAM)"
                value={`${health.memory_usage}%`}
                percentage={health.memory_usage}
                color="purple"
              />
              <HealthCard
                title="Active Sessions"
                value={health.active_users.toString()}
                percentage={100}
                color="green"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatusBox
                label="PostgreSQL Database"
                status={health.db_status}
              />
              <StatusBox
                label="Redis Cache / Queue"
                status={health.redis_status}
              />
              <StatusBox
                label="Celery Background Workers"
                status={`${health.celery_workers} Active`}
              />
            </div>
          </div>
        )}

        {/* 2. INTEGRATIONS */}
        {activeTab === "integrations" && <IntegrationHealthPanel />}

        {/* 3. PLATFORM CONFIGURATIONS */}
        {activeTab === "configs" && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 mb-4">
              Global feature flags and system-wide toggles. Changes take effect
              immediately.
            </p>
            {configs.map((config) => (
              <div
                key={config.id}
                className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-slate-800">{config.label}</p>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                      {config.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {config.description}
                  </p>
                </div>
                <ToggleSwitch
                  isEnabled={config.is_enabled}
                  onToggle={() =>
                    handleToggleConfig(config.id, config.is_enabled)
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* 4. ADMIN ACCOUNTS */}
        {activeTab === "admins" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-500">
                Manage system administrators and their access levels.
              </p>
              <button className="text-sm font-bold px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
                + Add Admin
              </button>
            </div>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">
                  <tr>
                    <th className="px-6 py-3">Admin Details</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Security</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {admin.full_name}
                        </p>
                        <p className="text-xs text-slate-500">{admin.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded uppercase ${admin.role === "super_admin" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"}`}
                        >
                          {admin.role.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {admin.two_factor_enabled ? (
                          <span className="text-xs text-green-600 font-bold flex items-center gap-1">
                            🔒 2FA Enabled
                          </span>
                        ) : (
                          <span className="text-xs text-red-600 font-bold">
                            🔓 2FA Disabled
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold ${admin.is_active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {admin.is_active ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-xs text-primary hover:underline font-bold mr-3">
                          Reset Password
                        </button>
                        <button className="text-xs text-red-500 hover:underline font-bold">
                          Revoke
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

function HealthCard({ title, value, percentage, color }: any) {
  const colors: Record<string, string> = {
    blue: "bg-blue-500",
    purple: "bg-purple-500",
    green: "bg-green-500",
  };
  return (
    <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
      <p className="text-xs text-slate-500 font-bold uppercase">{title}</p>
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
      <div className="w-full bg-slate-200 rounded-full h-2 mt-3">
        <div
          className={`${colors[color]} h-2 rounded-full transition-all`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        ></div>
      </div>
    </div>
  );
}

function StatusBox({ label, status }: any) {
  const isOk = status === "connected" || status.includes("Active");
  return (
    <div
      className={`p-4 rounded-xl border flex items-center gap-3 ${isOk ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}
    >
      <div
        className={`w-3 h-3 rounded-full ${isOk ? "bg-green-500" : "bg-red-500"}`}
      ></div>
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p
          className={`text-xs font-medium ${isOk ? "text-green-600" : "text-red-600"}`}
        >
          {status}
        </p>
      </div>
    </div>
  );
}

function ToggleSwitch({
  isEnabled,
  onToggle,
}: {
  isEnabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors ${isEnabled ? "bg-green-500" : "bg-slate-300"}`}
    >
      <span
        className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isEnabled ? "translate-x-6" : ""}`}
      />
    </button>
  );
}
