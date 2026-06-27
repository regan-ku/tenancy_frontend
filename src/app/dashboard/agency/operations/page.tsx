"use client";

import React, { useState, useEffect } from "react";
import {
  agencyOperationsApi,
  AgencyApplication,
  AgencyTransfer,
  AgencyTermination,
} from "@/api/agencyOperations.api";
import AgencyApplicationReviewModal from "@/components/agency/AgencyApplicationReviewModal";
import TerminationSettlementModal from "@/components/applications/TerminationSettlementModal";

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 0,
  }).format(amount);
};

// ✅ Helper functions to map transfers and terminations to AgencyApplication format
const mapTransferToApp = (transfer: any): AgencyApplication => ({
  id: transfer.id,
  application_type: "transfer",
  applicant_name: transfer.tenant_name,
  applicant_phone: transfer.applicant_phone || "N/A",
  property_name: transfer.from_property,
  landlord_name: "N/A",
  unit_code: transfer.from_unit,
  status: transfer.status,
  past_tenancy_notes: [],
  submitted_at: transfer.submitted_at,
  agency_can_approve: true,
  financial_status: transfer.financial_status || {
    rent_amount: 0,
    deposit_amount: 0,
    service_charge_amount: 0,
    deposit_paid: false,
    deposit_waived: false,
    service_charge_paid: false,
    service_charge_waived: false,
    rent_paid: false,
    rent_waived: false,
    tenancy_status: "no_tenancy",
  },
  from_property_name: transfer.from_property,
  from_unit_code: transfer.from_unit,
  to_property_name: transfer.to_property,
  to_unit_code: transfer.to_unit,
  transfer_reason: transfer.reason,
  desired_move_in_date: transfer.desired_move_in_date || undefined,
});

const mapTerminationToApp = (notice: any): AgencyApplication => ({
  id: notice.id,
  application_type: "termination",
  applicant_name: notice.tenant_name,
  applicant_phone: notice.applicant_phone || "N/A",
  property_name: notice.property_name,
  landlord_name: "N/A",
  unit_code: notice.unit_code,
  status: notice.status,
  past_tenancy_notes: [],
  submitted_at: new Date().toISOString(),
  agency_can_approve: true,
  financial_status: notice.financial_status || {
    rent_amount: 0,
    deposit_amount: 0,
    service_charge_amount: 0,
    deposit_paid: false,
    deposit_waived: false,
    service_charge_paid: false,
    service_charge_waived: false,
    rent_paid: false,
    rent_waived: false,
    tenancy_status: "no_tenancy",
  },
  proposed_move_out_date: notice.proposed_move_out_date,
  termination_type: notice.notice_type,
  termination_notes: notice.notes,
  penalty_amount: notice.penalty_amount || 0,
});

export default function AgencyOperationsPage() {
  // ✅ Added "awaiting_payment" to tabs
  const [activeTab, setActiveTab] = useState<
    "applications" | "transfers" | "terminations" | "awaiting_payment"
  >("applications");

  const [applications, setApplications] = useState<AgencyApplication[]>([]);
  const [transfers, setTransfers] = useState<AgencyTransfer[]>([]);
  const [terminations, setTerminations] = useState<AgencyTermination[]>([]);
  const [loading, setLoading] = useState(true);

  const [reviewingApp, setReviewingApp] = useState<AgencyApplication | null>(
    null,
  );

  // Settlement modal state
  const [settlementApp, setSettlementApp] = useState<{
    tenancyId: number;
    tenantName: string;
    initialPenalty: number;
  } | null>(null);

  // Waiver Modal State
  const [waiverApp, setWaiverApp] = useState<AgencyApplication | null>(null);
  const [selectedWaivers, setSelectedWaivers] = useState<
    ("rent" | "deposit" | "service_charge")[]
  >([]);
  const [waiverReason, setWaiverReason] = useState("");
  const [isSubmittingWaiver, setIsSubmittingWaiver] = useState(false);

  const [undoWaiverApp, setUndoWaiverApp] = useState<AgencyApplication | null>(
    null,
  );
  const [selectedUndoWaivers, setSelectedUndoWaivers] = useState<
    ("rent" | "deposit" | "service_charge")[]
  >([]);
  const [undoWaiverReason, setUndoWaiverReason] = useState("");
  const [isRevokingWaiver, setIsRevokingWaiver] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    const [apps, trans, terms] = await Promise.all([
      agencyOperationsApi.getApplications(),
      agencyOperationsApi.getTransfers(),
      agencyOperationsApi.getTerminations(),
    ]);

    setApplications(apps.filter((app) => app.status !== "completed"));
    setTransfers(trans.filter((t) => t.status !== "completed"));
    setTerminations(terms.filter((t) => t.status !== "completed"));
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  // ✅ Combine all approved applications for the "Awaiting Payment" tab
  const awaitingPaymentApps: AgencyApplication[] = [
    ...applications.filter((a) => a.status === "approved"),
    ...transfers.filter((t) => t.status === "approved").map(mapTransferToApp),
    ...terminations
      .filter((t) => t.status === "approved")
      .map(mapTerminationToApp),
  ];

  const toggleWaiver = (type: "rent" | "deposit" | "service_charge") => {
    setSelectedWaivers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const toggleUndoWaiver = (type: "rent" | "deposit" | "service_charge") => {
    setSelectedUndoWaivers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  };

  const calculateBalance = () => {
    if (!waiverApp) return 0;
    let balance = 0;
    const fs = waiverApp.financial_status;

    if (!fs.rent_paid && !fs.rent_waived && !selectedWaivers.includes("rent"))
      balance += fs.rent_amount;
    if (
      !fs.deposit_paid &&
      !fs.deposit_waived &&
      !selectedWaivers.includes("deposit")
    )
      balance += fs.deposit_amount;
    if (
      !fs.service_charge_paid &&
      !fs.service_charge_waived &&
      !selectedWaivers.includes("service_charge")
    )
      balance += fs.service_charge_amount;

    return balance;
  };

  const handleSubmitWaivers = async () => {
    if (!waiverApp || selectedWaivers.length === 0) {
      alert("Please select at least one item to waive.");
      return;
    }

    setIsSubmittingWaiver(true);
    try {
      const res = await agencyOperationsApi.applyWaiver(
        waiverApp.id,
        selectedWaivers,
        waiverReason || "Waived by manager",
      );
      alert(`✅ ${res.data.detail}`);
      setWaiverApp(null);
      setSelectedWaivers([]);
      setWaiverReason("");
      refreshData();
    } catch (error: any) {
      alert(
        "❌ " + (error.response?.data?.error || "Failed to apply waivers."),
      );
    } finally {
      setIsSubmittingWaiver(false);
    }
  };

  const handleUndoWaivers = async () => {
    if (!undoWaiverApp || selectedUndoWaivers.length === 0) {
      alert("Please select at least one waiver to revoke.");
      return;
    }

    setIsRevokingWaiver(true);
    try {
      const res = await agencyOperationsApi.revokeWaiver(
        undoWaiverApp.id,
        selectedUndoWaivers,
        undoWaiverReason || "Waiver revoked by manager",
      );
      alert(`✅ ${res.data.detail}`);
      setUndoWaiverApp(null);
      setSelectedUndoWaivers([]);
      setUndoWaiverReason("");
      refreshData();
    } catch (error: any) {
      alert(
        "❌ " + (error.response?.data?.error || "Failed to revoke waivers."),
      );
    } finally {
      setIsRevokingWaiver(false);
    }
  };

  const handleManagerCancel = async (appId: number) => {
    if (
      !confirm(
        "Are you sure you want to cancel this application? This will cancel the pending tenancy and free the unit.",
      )
    )
      return;
    const reason =
      window.prompt("Reason for cancellation (optional):") ||
      "Cancelled by manager";
    try {
      await agencyOperationsApi.managerCancelApplication(appId, reason);
      alert("✅ Application and tenancy cancelled successfully.");
      refreshData();
    } catch (error: any) {
      alert("❌ " + (error.response?.data?.error || "Failed to cancel."));
    }
  };

  const handleFinalizeSettlement = (notice: any) => {
    if (!notice.financial_status?.tenancy_id) {
      alert("❌ Could not find active tenancy record for this termination.");
      return;
    }
    setSettlementApp({
      tenancyId: notice.financial_status.tenancy_id,
      tenantName: notice.applicant_name || notice.tenant_name,
      initialPenalty: notice.penalty_amount || 0,
    });
  };

  const hasWaivers = (app: any) => {
    const fs = app.financial_status;
    return fs.rent_waived || fs.deposit_waived || fs.service_charge_waived;
  };

  const stats = {
    pendingApps: applications.filter((a) =>
      ["pending", "under_review", "escalated"].includes(a.status),
    ).length,
    awaitingPayment: awaitingPaymentApps.length,
    pendingTransfers: transfers.filter((t) =>
      ["pending", "under_review", "escalated"].includes(t.status),
    ).length,
    pendingTerminations: terminations.filter((t) =>
      ["pending", "under_review", "escalated"].includes(t.status),
    ).length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Operations & Approvals Queue
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Review applications, manage pending payments, and process operational
          requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard
          title="Pending Review"
          value={stats.pendingApps}
          icon="📝"
          color="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Awaiting Payment"
          value={stats.awaitingPayment}
          icon="💰"
          color="bg-green-50 text-green-600"
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

      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            { key: "applications", label: "Rental Applications" },
            { key: "transfers", label: "Internal Transfers" },
            { key: "terminations", label: "Notices & Terminations" },
            { key: "awaiting_payment", label: "Awaiting Payment" }, // ✅ NEW TAB
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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* RENTAL APPLICATIONS TAB */}
        {activeTab === "applications" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Target Property & Unit</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.filter((a) =>
                  ["pending", "under_review", "escalated"].includes(a.status),
                ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No pending rental applications.
                    </td>
                  </tr>
                ) : (
                  applications
                    .filter((a) =>
                      ["pending", "under_review", "escalated"].includes(
                        a.status,
                      ),
                    )
                    .map((app) => (
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
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-yellow-100 text-yellow-700`}
                          >
                            {app.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() => setReviewingApp(app)}
                            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))
                )}
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {transfers.filter((t) =>
                  ["pending", "under_review", "escalated"].includes(t.status),
                ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No pending transfers.
                    </td>
                  </tr>
                ) : (
                  transfers
                    .filter((t) =>
                      ["pending", "under_review", "escalated"].includes(
                        t.status,
                      ),
                    )
                    .map((req: any) => (
                      <tr key={req.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">
                            {req.tenant_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {req.applicant_phone}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-slate-600">
                          {req.from_unit} ({req.from_property})
                        </td>
                        <td className="px-6 py-4 text-primary font-bold">
                          {req.to_unit} ({req.to_property})
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-yellow-100 text-yellow-700">
                            {req.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              setReviewingApp(mapTransferToApp(req))
                            }
                            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))
                )}
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
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {terminations.filter((t) =>
                  ["pending", "under_review", "escalated"].includes(t.status),
                ).length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No pending notices.
                    </td>
                  </tr>
                ) : (
                  terminations
                    .filter((t) =>
                      ["pending", "under_review", "escalated"].includes(
                        t.status,
                      ),
                    )
                    .map((notice: any) => (
                      <tr key={notice.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-800">
                            {notice.tenant_name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {notice.applicant_phone}
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
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-yellow-100 text-yellow-700">
                            {notice.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right flex gap-2 justify-end">
                          <button
                            onClick={() =>
                              setReviewingApp(mapTerminationToApp(notice))
                            }
                            className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                          >
                            Review & Decide
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ NEW: AWAITING PAYMENT TAB */}
        {activeTab === "awaiting_payment" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Applicant</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Details</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {awaitingPaymentApps.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-slate-500"
                    >
                      No applications awaiting payment or settlement.
                    </td>
                  </tr>
                ) : (
                  awaitingPaymentApps.map((app) => (
                    <tr
                      key={`${app.application_type}-${app.id}`}
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
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            app.application_type === "transfer"
                              ? "bg-blue-100 text-blue-700"
                              : app.application_type === "termination"
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                          }`}
                        >
                          {app.application_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {app.application_type === "transfer" && (
                          <p>
                            {app.from_unit_code} → {app.to_unit_code}
                          </p>
                        )}
                        {app.application_type === "termination" && (
                          <p>Move-out: {app.proposed_move_out_date || "N/A"}</p>
                        )}
                        {app.application_type === "rental" && (
                          <p>Unit: {app.unit_code}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold capitalize bg-green-100 text-green-700">
                          {app.application_type === "termination"
                            ? "Awaiting Settlement"
                            : "Awaiting Payment"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right flex gap-2 justify-end">
                        {app.application_type === "termination" ? (
                          <button
                            onClick={() => handleFinalizeSettlement(app)}
                            className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-red-700 flex items-center gap-1"
                          >
                            <span>💰</span> Finalize Settlement
                          </button>
                        ) : (
                          <>
                            {!hasWaivers(app) && (
                              <button
                                onClick={() => setWaiverApp(app)}
                                className="text-xs bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-bold hover:bg-blue-200"
                              >
                                Apply Waiver
                              </button>
                            )}
                            {hasWaivers(app) && (
                              <button
                                onClick={() => setUndoWaiverApp(app)}
                                className="text-xs bg-amber-100 text-amber-700 px-3 py-1.5 rounded-lg font-bold hover:bg-amber-200"
                              >
                                Undo Waiver
                              </button>
                            )}
                          </>
                        )}
                        <button
                          onClick={() => handleManagerCancel(app.id)}
                          className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-lg font-bold hover:bg-red-200"
                        >
                          Cancel
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* UNIFIED REVIEW MODAL */}
      {reviewingApp && (
        <AgencyApplicationReviewModal
          application={reviewingApp}
          onClose={() => setReviewingApp(null)}
          onDecisionMade={() => {
            setReviewingApp(null);
            refreshData();
          }}
        />
      )}

      {/* TERMINATION SETTLEMENT MODAL */}
      {settlementApp && (
        <TerminationSettlementModal
          tenancyId={settlementApp.tenancyId}
          tenantName={settlementApp.tenantName}
          initialPenalty={settlementApp.initialPenalty}
          onClose={() => setSettlementApp(null)}
          onComplete={() => {
            setSettlementApp(null);
            refreshData();
          }}
        />
      )}

      {/* UNIFIED WAIVER MODAL */}
      {waiverApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-primary-dark">
                Apply Waivers
              </h2>
              <button
                onClick={() => {
                  setWaiverApp(null);
                  setSelectedWaivers([]);
                  setWaiverReason("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Applicant
                </p>
                <p className="font-bold text-slate-800">
                  {waiverApp.applicant_name}
                </p>
                <p className="text-xs text-slate-500">
                  Unit {waiverApp.unit_code} • {waiverApp.property_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Select items to waive:
                </label>
                <div className="space-y-3">
                  {(["rent", "deposit", "service_charge"] as const).map(
                    (type) => (
                      <div
                        key={type}
                        className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${waiverApp.financial_status[`${type}_paid`] || waiverApp.financial_status[`${type}_waived`] ? "bg-slate-50 border-slate-200" : "border-slate-200 hover:bg-slate-50"}`}
                      >
                        <label className="flex items-center cursor-pointer flex-1">
                          <input
                            type="checkbox"
                            checked={selectedWaivers.includes(type)}
                            onChange={() => toggleWaiver(type)}
                            disabled={
                              waiverApp.financial_status[`${type}_paid`] ||
                              waiverApp.financial_status[`${type}_waived`]
                            }
                            className="w-5 h-5 text-primary border-slate-300 rounded focus:ring-primary disabled:opacity-50"
                          />
                          <span className="ml-3 font-medium text-slate-700 capitalize">
                            {type === "service_charge"
                              ? "Service Charge"
                              : type}
                          </span>
                        </label>
                        <div className="text-right">
                          <p className="font-bold text-slate-800">
                            {formatCurrency(
                              waiverApp.financial_status[`${type}_amount`],
                            )}
                          </p>
                          {waiverApp.financial_status[`${type}_paid`] && (
                            <span className="text-xs text-green-600 font-bold">
                              PAID
                            </span>
                          )}
                          {waiverApp.financial_status[`${type}_waived`] && (
                            <span className="text-xs text-blue-600 font-bold">
                              WAIVED
                            </span>
                          )}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-blue-800">
                    Remaining Balance:
                  </span>
                  <span className="text-lg font-extrabold text-blue-900">
                    {formatCurrency(calculateBalance())}
                  </span>
                </div>
                {calculateBalance() === 0 && (
                  <p className="text-xs text-green-700 font-bold mt-1">
                    ✅ Tenancy will be fully activated!
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reason for Waiver:
                </label>
                <textarea
                  value={waiverReason}
                  onChange={(e) => setWaiverReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., Goodwill gesture..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setWaiverApp(null);
                  setSelectedWaivers([]);
                  setWaiverReason("");
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitWaivers}
                disabled={isSubmittingWaiver || selectedWaivers.length === 0}
                className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmittingWaiver ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Apply Waivers"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNIFIED UNDO WAIVER MODAL */}
      {undoWaiverApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-amber-800">Undo Waivers</h2>
              <button
                onClick={() => {
                  setUndoWaiverApp(null);
                  setSelectedUndoWaivers([]);
                  setUndoWaiverReason("");
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-6 h-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
                <p className="text-xs text-amber-700 font-bold uppercase mb-1">
                  ⚠️ Warning
                </p>
                <p className="text-sm text-amber-800">
                  Revoking waivers will reset the payment requirements.
                </p>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Applicant
                </p>
                <p className="font-bold text-slate-800">
                  {undoWaiverApp.applicant_name}
                </p>
                <p className="text-xs text-slate-500">
                  Unit {undoWaiverApp.unit_code} • {undoWaiverApp.property_name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">
                  Select waivers to revoke:
                </label>
                <div className="space-y-3">
                  {(["rent", "deposit", "service_charge"] as const).map(
                    (type) => {
                      const isWaived =
                        undoWaiverApp.financial_status[`${type}_waived`];
                      if (!isWaived) return null;
                      return (
                        <div
                          key={type}
                          className="flex items-center justify-between p-3 border border-amber-200 bg-amber-50 rounded-lg"
                        >
                          <label className="flex items-center cursor-pointer flex-1">
                            <input
                              type="checkbox"
                              checked={selectedUndoWaivers.includes(type)}
                              onChange={() => toggleUndoWaiver(type)}
                              className="w-5 h-5 text-amber-600 border-slate-300 rounded focus:ring-amber-500"
                            />
                            <span className="ml-3 font-medium text-slate-700 capitalize">
                              {type === "service_charge"
                                ? "Service Charge"
                                : type}
                            </span>
                          </label>
                          <div className="text-right">
                            <p className="font-bold text-slate-800">
                              {formatCurrency(
                                undoWaiverApp.financial_status[
                                  `${type}_amount`
                                ],
                              )}
                            </p>
                            <span className="text-xs text-blue-600 font-bold">
                              CURRENTLY WAIVED
                            </span>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Reason for Revocation:
                </label>
                <textarea
                  value={undoWaiverReason}
                  onChange={(e) => setUndoWaiverReason(e.target.value)}
                  rows={3}
                  placeholder="e.g., Policy change..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
              <button
                onClick={() => {
                  setUndoWaiverApp(null);
                  setSelectedUndoWaivers([]);
                  setUndoWaiverReason("");
                }}
                className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUndoWaivers}
                disabled={isRevokingWaiver || selectedUndoWaivers.length === 0}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isRevokingWaiver ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  "Revoke Waivers"
                )}
              </button>
            </div>
          </div>
        </div>
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
