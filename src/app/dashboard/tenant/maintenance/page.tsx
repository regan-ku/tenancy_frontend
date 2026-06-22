"use client";

import React, { useState, useEffect } from "react";
import {
  tenantMaintenanceApi,
  MaintenanceRequest,
  MaintenanceStatus,
} from "@/api/tenantMaintance.api";
import { tenantDashboardApi, PersonalTenancy } from "@/api/tenantDashboard.api";
import ReportMaintenanceModal from "@/components/tenant/ReportMaintenanceModal";

export default function TenantMaintenancePage() {
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterTenancy, setFilterTenancy] = useState<string>("all");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<MaintenanceRequest | null>(null);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    Promise.all([
      tenantDashboardApi.getMyPersonalTenancies(),
      tenantMaintenanceApi.getMyRequests(),
    ]).then(([tens, reqs]) => {
      setTenancies(tens);
      setRequests(reqs);
      setLoading(false);
    });
  }, []);

  const filteredRequests =
    filterTenancy === "all"
      ? requests
      : requests.filter((r) => r.tenancy_id === parseInt(filterTenancy));

  const handleAddComment = async () => {
    if (!selectedRequest || !newComment.trim()) return;
    // Mocking API call
    const mockUpdate = {
      id: `u-${Date.now()}`,
      timestamp: new Date().toISOString(),
      author: "You",
      author_role: "Tenant",
      comment: newComment,
    };
    setSelectedRequest({
      ...selectedRequest,
      updates: [...selectedRequest.updates, mockUpdate],
    });
    setNewComment("");
  };

  const getStatusColor = (status: MaintenanceStatus) => {
    const colors: Record<string, string> = {
      open: "bg-red-100 text-red-700",
      assigned: "bg-blue-100 text-blue-700",
      in_progress: "bg-yellow-100 text-yellow-700",
      pending_review: "bg-purple-100 text-purple-700",
      resolved: "bg-green-100 text-green-700",
      closed: "bg-slate-100 text-slate-600",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  const getPriorityBadge = (priority: string) => {
    if (priority === "emergency")
      return (
        <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded animate-pulse">
          🚨 EMERGENCY
        </span>
      );
    if (priority === "high")
      return (
        <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
          HIGH
        </span>
      );
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Maintenance & Repairs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Report issues, track repair progress, and communicate with on-site
            staff.
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
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
          Report New Issue
        </button>
      </div>

      {/* Tenancy Filter */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <label className="text-xs font-bold text-slate-500 uppercase flex items-center">
          Filter by Property:
        </label>
        <div className="flex flex-wrap gap-2 flex-1">
          <button
            onClick={() => setFilterTenancy("all")}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTenancy === "all" ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            All Properties
          </button>
          {tenancies.map((t) => (
            <button
              key={t.id}
              onClick={() => setFilterTenancy(t.id.toString())}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${filterTenancy === t.id.toString() ? "bg-primary text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
            >
              {t.property_name} ({t.unit_code})
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {loading ? (
          Array(4)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 animate-pulse rounded-2xl"
              ></div>
            ))
        ) : filteredRequests.length === 0 ? (
          <div className="col-span-2 bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
            <p className="text-4xl mb-2">✨</p>
            <p className="text-slate-500 font-medium">
              No maintenance requests found for this selection.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => setSelectedRequest(req)}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-slate-800">{req.title}</h3>
                    {getPriorityBadge(req.priority)}
                  </div>
                  <p className="text-xs text-slate-500">
                    {req.property_name} • Unit {req.unit_code}
                  </p>
                </div>
                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${getStatusColor(req.status)}`}
                >
                  {req.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                {req.description}
              </p>

              <div className="pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">
                  Reported: {req.created_at}
                </span>
                {req.assigned_to_name ? (
                  <span className="font-bold text-primary flex items-center gap-1">
                    👷 {req.assigned_to_name} ({req.assigned_to_role})
                  </span>
                ) : (
                  <span className="text-yellow-600 font-bold">
                    Awaiting Assignment
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ✅ SLIDE-OUT DETAIL PANEL & TIMELINE */}
      {selectedRequest && (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedRequest(null)}
        >
          <div
            className="w-full max-w-lg bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel Header */}
            <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-primary-dark">
                  {selectedRequest.title}
                </h2>
                <p className="text-sm text-slate-500">
                  {selectedRequest.property_name} - {selectedRequest.unit_code}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Panel Body */}
            <div className="p-6 flex-1 space-y-6">
              {/* Status & Assignee Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Current Status
                  </p>
                  <p
                    className={`text-sm font-bold mt-1 ${getStatusColor(selectedRequest.status).split(" ")[1]}`}
                  >
                    {selectedRequest.status.replace("_", " ").toUpperCase()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">
                    Assigned To
                  </p>
                  <p className="text-sm font-bold text-slate-800 mt-1">
                    {selectedRequest.assigned_to_name || "Unassigned"}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {selectedRequest.assigned_to_role}
                  </p>
                </div>
              </div>

              {/* Description & Media */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-2">
                  Issue Description
                </h3>
                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
                  {selectedRequest.description}
                </p>
                {selectedRequest.media.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto">
                    {selectedRequest.media.map((m) => (
                      <div
                        key={m.id}
                        className="w-20 h-20 rounded-lg bg-slate-200 flex-shrink-0 flex items-center justify-center text-2xl"
                      >
                        🖼️
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline / Updates */}
              <div>
                <h3 className="text-sm font-bold text-slate-700 mb-3">
                  Activity Timeline
                </h3>
                <div className="space-y-4 border-l-2 border-slate-200 pl-4 ml-2">
                  {selectedRequest.updates.map((update) => (
                    <div key={update.id} className="relative">
                      <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-white border-2 border-primary"></div>
                      <div className="bg-slate-50 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-slate-800">
                            {update.author}{" "}
                            <span className="text-slate-400 font-normal">
                              ({update.author_role})
                            </span>
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {update.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600">
                          {update.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel Footer (Add Comment) */}
            <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add an update or comment..."
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90"
                >
                  Send
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-2 text-center">
                Messages are sent directly to the assigned technician's
                dashboard.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {showReportModal && (
        <ReportMaintenanceModal
          tenancies={tenancies}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => {
            setShowReportModal(false);
            // In production, re-fetch requests here
          }}
        />
      )}
    </div>
  );
}
