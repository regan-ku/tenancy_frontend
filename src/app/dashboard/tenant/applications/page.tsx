"use client";

import React, { useState, useEffect } from "react";
import {
  tenantOperationsApi,
  TenantApplication,
  TenantNotice,
} from "@/api/tenantOperations";
import { tenantDashboardApi, PersonalTenancy } from "@/api/tenantDashboard.api";
import RentalApplicationModal from "@/components/tenant/RentalApplicationModal";
import TransferRequestModal from "@/components/tenant/TransferRequestModal";
import NoticeToVacateModal from "@/components/tenant/NoticeToVacateModal";

export default function TenantApplicationsPage() {
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [notices, setNotices] = useState<TenantNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState<PersonalTenancy | null>(
    null,
  );
  const [noticeTarget, setNoticeTarget] = useState<PersonalTenancy | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      const [tens, apps, nots] = await Promise.all([
        tenantDashboardApi.getMyPersonalTenancies(),
        tenantOperationsApi.getMyApplications(),
        tenantOperationsApi.getMyNotices(),
      ]);
      setTenancies(tens);
      setApplications(apps);
      setNotices(nots);
      setLoading(false);
    };
    fetchData();
  }, []);

  const refreshData = () => {
    setShowRentalModal(false);
    setTransferTarget(null);
    setNoticeTarget(null);
    // In production, re-fetch data here
  };

  // ✅ Group applications by lifecycle stage
  const activeApps = applications.filter((app) =>
    ["pending", "under_review", "approved"].includes(app.status),
  );
  const pastApps = applications.filter((app) =>
    ["completed", "rejected", "cancelled", "expired"].includes(app.status),
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Applications & Requests
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage new rental applications, transfer requests, and notices to
            vacate.
          </p>
        </div>
        <button
          onClick={() => setShowRentalModal(true)}
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
          Apply for New Unit
        </button>
      </div>

      {/* 1. ACTIVE TENANCIES (Action Triggers) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">
          My Active Tenancies
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Select a property to request a transfer to another unit or submit a
          notice to vacate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenancies.map((t) => (
            <div
              key={t.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-slate-800">
                    {t.property_name}
                  </h3>
                  <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">
                    Active
                  </span>
                </div>
                <p className="text-sm text-slate-500">
                  Unit {t.unit_code} • {t.unit_type}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <button
                  onClick={() => setTransferTarget(t)}
                  className="py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors"
                >
                  🔄 Request Transfer
                </button>
                <button
                  onClick={() => setNoticeTarget(t)}
                  className="py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors"
                >
                  📤 Notice to Vacate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE REQUESTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Active Requests</h2>
          <p className="text-xs text-slate-500 mt-1">
            Track the status of your current applications and notices.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Property / Unit Details</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeApps.map((app) => (
                <tr
                  key={app.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-bold px-2 py-1 rounded uppercase ${app.type === "rental" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                    >
                      {app.type === "rental" ? "New Rental" : "Transfer"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {app.property_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {app.type === "transfer"
                        ? `From ${app.unit_code} → To ${app.target_unit_code}`
                        : `Target: ${app.unit_code}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">
                    {app.submitted_at}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={app.status} />
                  </td>
                </tr>
              ))}
              {notices.map((notice) => (
                <tr
                  key={notice.id}
                  className="hover:bg-slate-50 transition-colors bg-red-50/30"
                >
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-red-100 text-red-700">
                      Notice to Vacate
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">
                      {notice.property_name}
                    </p>
                    <p className="text-xs text-slate-500">
                      Unit {notice.unit_code} • Move-out:{" "}
                      {notice.proposed_move_out_date}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">-</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={notice.status} />
                  </td>
                </tr>
              ))}
              {activeApps.length === 0 && notices.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No active requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✅ 3. PAST APPLICATIONS (Completed, Rejected, Cancelled) */}
      {pastApps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-500">
              Past Applications
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Previous applications and their final outcomes.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left opacity-80">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Request Type</th>
                  <th className="px-6 py-4">Property / Unit Details</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastApps.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded uppercase ${app.type === "rental" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}
                      >
                        {app.type === "rental" ? "New Rental" : "Transfer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {app.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.type === "transfer"
                          ? `From ${app.unit_code} → To ${app.target_unit_code}`
                          : `Target: ${app.unit_code}`}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {app.submitted_at}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={app.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showRentalModal && <RentalApplicationModal onClose={refreshData} />}
      {transferTarget && (
        <TransferRequestModal tenancy={transferTarget} onClose={refreshData} />
      )}
      {noticeTarget && (
        <NoticeToVacateModal tenancy={noticeTarget} onClose={refreshData} />
      )}
    </div>
  );
}

// ✅ Updated Status Badge with new lifecycle states
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    under_review: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-indigo-100 text-indigo-700", // ✅ NEW
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-600", // ✅ NEW
    expired: "bg-slate-100 text-slate-600", // ✅ NEW
    pending_review: "bg-blue-100 text-blue-700",
    disputed: "bg-orange-100 text-orange-700",
  };

  const labels: Record<string, string> = {
    completed: "Converted to Tenancy",
    cancelled: "Cancelled",
    expired: "Expired",
    approved: "Awaiting Payment",
  };

  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors[status] || "bg-slate-100 text-slate-600"}`}
    >
      {labels[status] || status.replace("_", " ")}
    </span>
  );
}
