"use client";

import React, { useState, useEffect } from "react";
import {
  adminAuditApi,
  GlobalAuditLog,
  SecurityAlert,
  BlockedIP,
} from "@/api/adminAudit.api";
import AuditLogDetailModal from "@/components/admin/AuditLogDetailModal";

export default function AdminAuditPage() {
  const [activeTab, setActiveTab] = useState<"logs" | "security" | "ips">(
    "logs",
  );

  const [logs, setLogs] = useState<GlobalAuditLog[]>([]);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<BlockedIP[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Modal State
  const [selectedLog, setSelectedLog] = useState<GlobalAuditLog | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [logsData, alertsData, ipsData] = await Promise.all([
        adminAuditApi.getAuditLogs(),
        adminAuditApi.getSecurityAlerts(),
        adminAuditApi.getBlockedIPs(),
      ]);
      setLogs(logsData);
      setAlerts(alertsData);
      setBlockedIPs(ipsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesModule =
      moduleFilter === "all" || log.app_module === moduleFilter;
    const matchesSearch =
      log.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_entity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ip_address.includes(searchTerm);
    return matchesModule && matchesSearch;
  });

  const handleUnblock = async (id: string) => {
    if (confirm("Are you sure you want to unblock this IP address?")) {
      await adminAuditApi.unblockIP(id);
      setBlockedIPs(blockedIPs.filter((ip) => ip.id !== id));
    }
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      LOW: "bg-blue-100 text-blue-700",
      MEDIUM: "bg-yellow-100 text-yellow-700",
      HIGH: "bg-orange-100 text-orange-700",
      CRITICAL: "bg-red-100 text-red-700",
    };
    return colors[severity] || "bg-slate-100 text-slate-600";
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      SUCCESS: "bg-green-100 text-green-700",
      FAILED: "bg-red-100 text-red-700",
      BLOCKED: "bg-slate-200 text-slate-600",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          System Audit, Security & Access Control
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Monitor platform-wide activity logs, manage security alerts, and
          enforce IP access restrictions.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "logs", label: "Global Activity Logs" },
            {
              key: "security",
              label: `Security Alerts (${alerts.filter((a) => !a.is_resolved).length})`,
            },
            { key: "ips", label: "Blocked IPs" },
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
        {/* 1. GLOBAL ACTIVITY LOGS */}
        {activeTab === "logs" && (
          <>
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
                  placeholder="Search user, entity, or IP..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none font-medium capitalize"
              >
                <option value="all">All System Modules</option>
                <option value="accounts">Accounts</option>
                <option value="properties">Properties</option>
                <option value="tenancies">Tenancies</option>
                <option value="payments">Payments</option>
                <option value="applications">Applications</option>
                <option value="marketplace">Marketplace</option>
                <option value="agencies">Agencies</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary/90 flex items-center gap-2 whitespace-nowrap">
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
                Export CSV
              </button>
            </div>

            {/* Logs Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">User & Role</th>
                    <th className="px-6 py-4">Module & Action</th>
                    <th className="px-6 py-4">Target Entity</th>
                    <th className="px-6 py-4">IP Address</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        Loading audit logs...
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-12 text-center text-slate-400"
                      >
                        No logs match your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 whitespace-nowrap">
                          {log.timestamp}
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">
                            {log.user_name}
                          </p>
                          <p className="text-xs text-slate-400 capitalize">
                            {log.user_role}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded uppercase">
                            {log.app_module}
                          </span>
                          <p className="text-xs font-medium text-slate-700 mt-1">
                            {log.action_type}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 max-w-xs truncate">
                          {log.target_entity}
                        </td>
                        <td className="px-6 py-4 text-xs font-mono text-slate-500">
                          {log.ip_address}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusColor(log.status)}`}
                          >
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* 2. SECURITY ALERTS */}
        {activeTab === "security" && (
          <div className="p-6 space-y-4">
            {alerts.length === 0 ? (
              <p className="text-center text-slate-400 py-12">
                No security alerts. System is secure.
              </p>
            ) : (
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`p-5 rounded-xl border flex items-start gap-4 ${alert.is_resolved ? "bg-slate-50 border-slate-200 opacity-60" : "bg-white border-slate-200 shadow-sm"}`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-xl flex-shrink-0 ${getSeverityColor(alert.severity)}`}
                  >
                    {alert.severity === "CRITICAL"
                      ? "🚨"
                      : alert.severity === "HIGH"
                        ? "⚠️"
                        : "ℹ️"}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-slate-800">
                          {alert.alert_type}
                        </p>
                        <p className="text-sm text-slate-600 mt-1">
                          {alert.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-2 font-mono">
                          Source IP: {alert.source_ip} • {alert.timestamp}
                        </p>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </span>
                    </div>
                    {!alert.is_resolved && (
                      <div className="mt-4 flex gap-2">
                        <button className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700">
                          Block IP
                        </button>
                        <button className="text-xs bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold hover:bg-slate-300">
                          Mark Resolved
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 3. BLOCKED IPS */}
        {activeTab === "ips" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">IP Address</th>
                  <th className="px-6 py-4">Reason for Blocking</th>
                  <th className="px-6 py-4">Blocked At</th>
                  <th className="px-6 py-4">Expires</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {blockedIPs.map((ip) => (
                  <tr
                    key={ip.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-mono font-bold text-slate-800">
                      {ip.ip_address}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{ip.reason}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {ip.blocked_at}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {ip.expires_at || (
                        <span className="font-bold text-red-600">
                          Permanent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleUnblock(ip.id)}
                        className="text-xs bg-green-50 text-green-700 px-3 py-1.5 rounded-lg font-bold hover:bg-green-100"
                      >
                        Unblock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedLog && (
        <AuditLogDetailModal
          log={selectedLog}
          onClose={() => setSelectedLog(null)}
        />
      )}
    </div>
  );
}
