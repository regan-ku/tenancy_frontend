"use client";

import React, { useState, useEffect } from "react";
import {
  agencyMaintenanceApi,
  AgencyMaintenanceRequest,
  MaintenanceStatus,
  AgencyStaffOption,
} from "@/api/agencyMaintance.api";
import AssignMaintenanceStaffModal from "@/components/agency/AssignMaintanceStaffModal";

export default function AgencyMaintenancePage() {
  const [requests, setRequests] = useState<AgencyMaintenanceRequest[]>([]);
  const [staff, setStaff] = useState<AgencyStaffOption[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterProperty, setFilterProperty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal State
  const [assigningRequest, setAssigningRequest] =
    useState<AgencyMaintenanceRequest | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [reqData, staffData] = await Promise.all([
        agencyMaintenanceApi.getDelegatedRequests(),
        agencyMaintenanceApi.getAssignableStaff(),
      ]);
      setRequests(reqData);
      setStaff(staffData);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Extract unique properties for the filter dropdown
  const uniqueProperties = Array.from(
    new Set(requests.map((r) => r.property_name)),
  );

  const filteredRequests = requests.filter((r) => {
    const matchesProperty =
      filterProperty === "all" || r.property_name === filterProperty;
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    return matchesProperty && matchesStatus;
  });

  // KPI Calculations
  const openCount = requests.filter((r) => r.status === "open").length;
  const breachedSLA = requests.filter((r) => {
    if (r.status === "resolved" || r.status === "closed") return false;
    return new Date(r.sla_deadline) < new Date();
  }).length;
  const assignedToTeam = requests.filter(
    (r) => r.assigned_staff_id !== null,
  ).length;

  const handleStatusChange = async (
    requestId: string,
    newStatus: MaintenanceStatus,
  ) => {
    await agencyMaintenanceApi.updateStatus(requestId, newStatus);
    setRequests(
      requests.map((r) =>
        r.id === requestId ? { ...r, status: newStatus } : r,
      ),
    );
  };

  const handleAssignmentSuccess = (
    requestId: string,
    staffId: number,
    staffName: string,
  ) => {
    setRequests(
      requests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              assigned_staff_id: staffId,
              assigned_staff_name: staffName,
              status: "assigned",
            }
          : r,
      ),
    );
    setAssigningRequest(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "emergency":
        return "bg-red-100 text-red-700 animate-pulse";
      case "high":
        return "bg-orange-100 text-orange-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-red-50 text-red-600 border-red-100";
      case "assigned":
        return "bg-blue-50 text-blue-600 border-blue-100";
      case "in_progress":
        return "bg-yellow-50 text-yellow-600 border-yellow-100";
      case "resolved":
        return "bg-green-50 text-green-600 border-green-100";
      default:
        return "bg-slate-50 text-slate-600 border-slate-100";
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Maintenance & Field Operations
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Oversee maintenance requests across all delegated properties and
          dispatch your internal team.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Open Requests"
          value={openCount}
          icon="📥"
          color="bg-red-50 text-red-600"
        />
        <KPICard
          title="SLA Breached"
          value={breachedSLA}
          icon="⏱️"
          color={
            breachedSLA > 0
              ? "bg-red-50 text-red-600"
              : "bg-green-50 text-green-600"
          }
        />
        <KPICard
          title="Assigned to Team"
          value={assignedToTeam}
          icon="👷"
          color="bg-blue-50 text-blue-600"
        />
        <KPICard
          title="Total Active"
          value={
            requests.filter(
              (r) => r.status !== "closed" && r.status !== "resolved",
            ).length
          }
          icon="🛠️"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Filter by Delegated Property
          </label>
          <select
            value={filterProperty}
            onChange={(e) => setFilterProperty(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
          >
            <option value="all">All Managed Properties</option>
            {uniqueProperties.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open (Unassigned)</option>
            <option value="assigned">Assigned</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Property & Landlord</th>
                <th className="px-6 py-4">Issue Details</th>
                <th className="px-6 py-4">Priority & SLA</th>
                <th className="px-6 py-4">Assigned Staff</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading maintenance requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No requests match your filters.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const isBreached =
                    req.status !== "resolved" &&
                    req.status !== "closed" &&
                    new Date(req.sla_deadline) < new Date();

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {req.property_name}
                        </p>
                        <p className="text-xs text-slate-500">
                          Unit {req.unit_code}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                          Owner: {req.landlord_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-700">
                          {req.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Tenant: {req.tenant_name}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getPriorityColor(req.priority)}`}
                        >
                          {req.priority}
                        </span>
                        <p
                          className={`text-[10px] mt-1 font-mono ${isBreached ? "text-red-600 font-bold" : "text-slate-400"}`}
                        >
                          {isBreached ? "⚠️ BREACHED" : "SLA:"}{" "}
                          {new Date(req.sla_deadline).toLocaleString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {req.assigned_staff_name ? (
                          <div>
                            <p className="font-bold text-slate-800 text-xs">
                              {req.assigned_staff_name}
                            </p>
                            <p className="text-[10px] text-slate-500">
                              Agency Staff
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-yellow-600 font-bold italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(
                              req.id,
                              e.target.value as MaintenanceStatus,
                            )
                          }
                          className={`text-[10px] font-bold px-2 py-1 rounded border uppercase cursor-pointer ${getStatusColor(req.status)}`}
                        >
                          <option value="open">Open</option>
                          <option value="assigned">Assigned</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {req.status === "open" ? (
                          <button
                            onClick={() => setAssigningRequest(req)}
                            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Assign Staff
                          </button>
                        ) : (
                          <button className="text-xs text-slate-400 cursor-default">
                            Dispatched
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Staff Modal */}
      {assigningRequest && (
        <AssignMaintenanceStaffModal
          request={assigningRequest}
          staffOptions={staff}
          onClose={() => setAssigningRequest(null)}
          onSuccess={handleAssignmentSuccess}
        />
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENTS
// ==========================================

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
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}
