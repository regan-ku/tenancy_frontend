"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  tenantOperationsApi,
  TenantApplication,
  TenantNotice,
} from "@/api/tenantOperations.api";
import { tenanciesApi, PersonalTenancy, TenantKPIs } from "@/api/tenancies.api";
import RentalApplicationModal from "@/components/tenant/RentalApplicationModal";
import TransferRequestModal from "@/components/tenant/TransferRequestModal";
import NoticeToVacateModal from "@/components/tenant/NoticeToVacateModal";

export default function TenantApplicationsPage() {
  const [tenancies, setTenancies] = useState<PersonalTenancy[]>([]);
  const [applications, setApplications] = useState<TenantApplication[]>([]);
  const [notices, setNotices] = useState<TenantNotice[]>([]);
  const [kpis, setKpis] = useState<TenantKPIs>({
    active_tenancies_count: 0,
    total_outstanding_balance: 0,
    open_maintenance_requests: 0,
    next_billing_date: "",
  });
  
  // ✅ THE FIX: Replaced generic `loading` with `isInitialLoad`
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [cancellingId, setCancellingId] = useState<number | null>(null);

  const [showRentalModal, setShowRentalModal] = useState(false);
  const [transferTarget, setTransferTarget] = useState<PersonalTenancy | null>(null);
  const [noticeTarget, setNoticeTarget] = useState<PersonalTenancy | null>(null);

  // Centralized data fetching function
  const fetchData = useCallback(async () => {
    try {
      // 1. Fetch core data in parallel
      const [tens, apps, nots] = await Promise.all([
        tenanciesApi.getMyPersonalTenancies(),
        tenantOperationsApi.getMyApplications(),
        tenantOperationsApi.getMyNotices(),
      ]);
      
      setTenancies(tens);
      setApplications(apps);
      setNotices(nots);

      // 2. Fetch KPIs (Passing 'tens' allows frontend fallback calculation if backend endpoint is missing)
      const kpiData = await tenanciesApi.getTenantKPIs(tens);
      setKpis(kpiData);

    } catch (error) {
      console.error("Failed to load tenant data", error);
    } finally {
      // ✅ THE FIX: Once initial load is complete, we NEVER show the full-page spinner again.
      // Subsequent calls to fetchData() will just silently swap the data arrays in the background.
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    }
  }, [isInitialLoad]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCancelApplication = async (id: number) => {
    if (!confirm("Are you sure you want to cancel this request? This action cannot be undone.")) return;
    
    setCancellingId(id);
    try {
      await tenantOperationsApi.cancelApplication(id);
      alert("Request cancelled successfully.");
      fetchData(); // Silently updates the table in the background
    } catch (error: any) {
      alert("Failed to cancel request: " + (error.response?.data?.detail || "Unknown error"));
    } finally {
      setCancellingId(null);
    }
  };

  // ✅ NEW: Just closes the modal, no network requests
  const closeModal = () => {
    setShowRentalModal(false);
    setTransferTarget(null);
    setNoticeTarget(null);
  };

  // ✅ NEW: Closes modal AND silently refreshes data in the background
  const handleModalSuccess = () => {
    closeModal();
    fetchData(); 
  };

  // Group applications by lifecycle stage
  const activeApps = applications.filter((app) =>
    ["pending", "under_review", "approved", "termination"].includes(app.status) || 
    (app.type === "termination" && ["pending", "under_review", "approved"].includes(app.status))
  );
  
  const pastApps = applications.filter((app) =>
    ["completed", "rejected", "cancelled", "expired"].includes(app.status),
  );

  // ✅ THE FIX: This block now ONLY runs the very first time the user visits the URL.
  if (isInitialLoad) {
    return <div className="p-12 text-center text-slate-500">Loading your applications and requests...</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">Applications & Requests</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage new rental applications, transfer requests, and notices to vacate.
          </p>
        </div>
        <button
          onClick={() => setShowRentalModal(true)}
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Apply for New Unit
        </button>
      </div>

      {/* ✅ 1. KPI SUMMARY DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-bold">Active Tenancies</p>
          <p className="text-2xl font-extrabold text-primary-dark mt-1">{kpis.active_tenancies_count}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-bold">Outstanding Balance</p>
          <p className={`text-2xl font-extrabold mt-1 ${(kpis.total_outstanding_balance || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
            KES {(kpis.total_outstanding_balance || 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-xs text-slate-500 uppercase font-bold">Next Billing Date</p>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {kpis.next_billing_date ? new Date(kpis.next_billing_date).toLocaleDateString() : "N/A"}
          </p>
        </div>
      </div>

      {/* ✅ 2. ACTIVE TENANCIES (Enriched Cards) */}
      <div>
        <h2 className="text-lg font-bold text-slate-800 mb-4">My Active Tenancies</h2>
        <p className="text-xs text-slate-500 mb-4">
          Select a property to request a transfer to another unit or submit a notice to vacate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tenancies.length > 0 ? tenancies.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">{t.property_name}</h3>
                    <p className="text-xs text-slate-500">{t.landlord_or_agency_name}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    t.status === "active" ? "bg-green-100 text-green-700" : 
                    t.status === "pending_payment" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"
                  }`}>
                    {t.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mb-3">Unit {t.unit_code} • {t.unit_type}</p>
                
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="text-slate-500">Monthly Rent</p>
                    <p className="font-bold text-slate-800">KES {t.rent_amount?.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 p-2 rounded">
                    <p className="text-slate-500">Balance Due</p>
                    <p className={`font-bold ${(t.balance_due || 0) > 0 ? "text-red-600" : "text-green-600"}`}>
                      KES {(t.balance_due || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-500">
                  Lease ends: <span className="font-medium text-slate-700">{t.lease_end_date ? new Date(t.lease_end_date).toLocaleDateString() : "Ongoing"}</span>
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                <button onClick={() => setTransferTarget(t)} className="py-2 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg hover:bg-blue-100 transition-colors">
                  🔄 Request Transfer
                </button>
                <button onClick={() => setNoticeTarget(t)} className="py-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors">
                  📤 Notice to Vacate
                </button>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
              You do not have any active tenancies at the moment.
            </div>
          )}
        </div>
      </div>

      {/* 3. ACTIVE REQUESTS */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800">Active Requests</h2>
          <p className="text-xs text-slate-500 mt-1">Track the status of your current applications and notices.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Request Type</th>
                <th className="px-6 py-4">Property / Unit Details</th>
                <th className="px-6 py-4">Submitted</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeApps.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                      app.type === "rental" ? "bg-purple-100 text-purple-700" : 
                      app.type === "termination" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {app.type === "rental" ? "New Rental" : app.type === "termination" ? "Notice to Vacate" : "Transfer"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{app.property_name}</p>
                    <p className="text-xs text-slate-500">
                      {app.type === "transfer" ? `From ${app.unit_code} → To ${app.target_unit_code}` : `Target: ${app.unit_code}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{new Date(app.submitted_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                  <td className="px-6 py-4 text-right">
                    {["pending", "under_review"].includes(app.status) && (
                      <button
                        onClick={() => handleCancelApplication(app.id)}
                        disabled={cancellingId === app.id}
                        className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                      >
                        {cancellingId === app.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-slate-50 transition-colors bg-red-50/30">
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-red-100 text-red-700">Notice to Vacate</span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-slate-800">{notice.property_name}</p>
                    <p className="text-xs text-slate-500">Unit {notice.unit_code} • Move-out: {notice.proposed_move_out_date}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-xs">-</td>
                  <td className="px-6 py-4"><StatusBadge status={notice.status} /></td>
                  <td className="px-6 py-4 text-right">
                    {["pending", "under_review"].includes(notice.status) && (
                      <button
                        onClick={() => handleCancelApplication(notice.id)}
                        disabled={cancellingId === notice.id}
                        className="text-xs font-bold text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                      >
                        {cancellingId === notice.id ? "Cancelling..." : "Cancel"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}

              {activeApps.length === 0 && notices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No active requests.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. PAST APPLICATIONS (Historical Record) */}
      {pastApps.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-500">Past Applications</h2>
            <p className="text-xs text-slate-400 mt-1">Previous applications and their final outcomes.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left opacity-80">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Request Type</th>
                  <th className="px-6 py-4">Property / Unit Details</th>
                  <th className="px-6 py-4">Submitted</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pastApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
                        app.type === "rental" ? "bg-purple-100 text-purple-700" : 
                        app.type === "termination" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
                      }`}>
                        {app.type === "rental" ? "New Rental" : app.type === "termination" ? "Notice to Vacate" : "Transfer"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{app.property_name}</p>
                      <p className="text-xs text-slate-500">
                        {app.type === "transfer" ? `From ${app.unit_code} → To ${app.target_unit_code}` : `Target: ${app.unit_code}`}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(app.submitted_at).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><StatusBadge status={app.status} /></td>
                    <td className="px-6 py-4 text-right text-slate-400 text-xs">-</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* ✅ UPDATED: Separated simple closing from success-based background refreshing */}
      {showRentalModal && <RentalApplicationModal onClose={closeModal} onComplete={handleModalSuccess} />}
      {transferTarget && <TransferRequestModal tenancy={transferTarget} onClose={closeModal} onComplete={handleModalSuccess} />}
      {noticeTarget && <NoticeToVacateModal tenancy={noticeTarget} onClose={closeModal} onComplete={handleModalSuccess} />}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-700",
    under_review: "bg-blue-100 text-blue-700",
    approved: "bg-green-100 text-green-700",
    completed: "bg-indigo-100 text-indigo-700",
    rejected: "bg-red-100 text-red-700",
    cancelled: "bg-slate-100 text-slate-600",
    expired: "bg-slate-100 text-slate-600",
  };

  const labels: Record<string, string> = {
    completed: "Converted to Tenancy",
    cancelled: "Cancelled",
    expired: "Expired",
    approved: "Awaiting Payment",
  };

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${colors[status] || "bg-slate-100 text-slate-600"}`}>
      {labels[status] || status.replace("_", " ")}
    </span>
  );
}