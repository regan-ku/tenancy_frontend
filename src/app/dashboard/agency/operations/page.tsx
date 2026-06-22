"use client";

import React, { useState, useEffect } from "react";
import {
  agencyOperationsApi,
  AgencyApplication,
  AgencyTransfer,
  AgencyTermination,
} from "@/api/agencyOperations.api";
import AgencyApplicationReviewModal from "@/components/agency/AgencyApplicationReviewModal";

export default function AgencyOperationsPage() {
  const [activeTab, setActiveTab] = useState<
    "applications" | "transfers" | "terminations"
  >("applications");
  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [transfers, setTransfers] = useState<AgencyTransfer[]>([]);
  const [terminations, setTerminations] = useState<AgencyTermination[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewingApp, setReviewingApp] = useState<AgencyApplication | null>(
    null,
  );

  useEffect(() => {
    const fetchData = async () => {
      const [apps, trans, terms] = await Promise.all([
        agencyOperationsApi.getApplications(),
        agencyOperationsApi.getTransfers(),
        agencyOperationsApi.getTerminations(),
      ]);
      setApplications(apps);
      setTransfers(trans);
      setTerminations(terms);
      setLoading(false);
    };
    fetchData();
  }, []);

  const stats = {
    pendingApps: applications.filter((a) => a.status === "pending").length,
    pendingTransfers: transfers.filter((t) => t.status === "pending").length,
    pendingTerminations: terminations.filter(
      (t) => t.status === "pending_review",
    ).length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Operations & Approvals Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review rental applications, transfer requests, and move-out notices
          for your delegated properties.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Pending Applications"
          value={stats.pendingApps}
          icon="📝"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Transfer Requests"
          value={stats.pendingTransfers}
          icon="🔄"
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Move-Out Notices"
          value={stats.pendingTerminations}
          icon="📦"
          color="bg-orange-50 text-orange-600"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "applications", label: "Rental Applications" },
            { key: "transfers", label: "Internal Transfers" },
            { key: "terminations", label: "Notices & Terminations" },
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

      {/* Tab Content */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Target Property & Unit</th>
                  <th className="px-6 py-4">Landlord</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => (
                  <tr
                    key={app.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {app.applicant_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {app.applicant_phone}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700">
                        {app.property_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        Unit {app.unit_code}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {app.landlord_name}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${app.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-slate-100 text-slate-600"}`}
                      >
                        {app.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setReviewingApp(app)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                      >
                        Review & Decide
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TRANSFERS TAB */}
        {activeTab === "transfers" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tenant</th>
                  <th className="px-6 py-4">From</th>
                  <th className="px-6 py-4">To</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">
                      {req.tenant_name}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {req.from_unit}{" "}
                      <span className="text-xs text-slate-400">
                        ({req.from_property})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-primary font-bold">
                      {req.to_unit}{" "}
                      <span className="text-xs text-slate-400 font-normal">
                        ({req.to_property})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="px-6 py-4 text-right flex gap-2 justify-end">
                      <button className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold">
                        Approve
                      </button>
                      <button className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold">
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TERMINATIONS TAB */}
        {activeTab === "terminations" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Tenant & Unit</th>
                  <th className="px-6 py-4">Notice Type</th>
                  <th className="px-6 py-4">Move-Out Date</th>
                  <th className="px-6 py-4">Notes</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terminations.map((notice) => (
                  <tr key={notice.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">
                        {notice.tenant_name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {notice.unit_code} • {notice.property_name}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 capitalize">
                        {notice.notice_type.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {notice.proposed_move_out_date}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs max-w-xs truncate">
                      {notice.notes}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold">
                        Process Checkout
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Review Modal */}
      {reviewingApp && (
        <AgencyApplicationReviewModal
          application={reviewingApp}
          onClose={() => setReviewingApp(null)}
          onDecision={() => {
            setApplications(
              applications.filter((a) => a.id !== reviewingApp.id),
            );
            setReviewingApp(null);
          }}
        />
      )}
    </div>
  );
}

function StatCard({ title, value, icon, color }: any) {
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
