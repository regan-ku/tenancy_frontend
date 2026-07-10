"use client";

import React, { useState } from "react";
import {
  LandlordApplication,
  landlordOperationsApi,
} from "@/api/landlordOperations.api";

interface Props {
  application: LandlordApplication;
  onClose: () => void;
  onDecisionMade: () => void;
}

export default function LandlordApplicationReviewModal({
  application,
  onClose,
  onDecisionMade,
}: Props) {
  const [decision, setDecision] = useState<
    "approved" | "rejected" | "escalated"
  >("approved");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (
      (decision === "rejected" || decision === "escalated") &&
      !reason.trim()
    ) {
      setError("A reason is required for rejection or escalation.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // ✅ Uses the Landlord API instead of Agency API
      await landlordOperationsApi.makeDecision(
        application.id,
        decision,
        reason,
      );
      onDecisionMade();
    } catch (err: any) {
      console.error("Decision failed", err);
      setError(
        err.response?.data?.detail ||
          err.response?.data?.error ||
          "Failed to process decision.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderNotes = () => (
    <div className="mt-4 pt-4 border-t border-slate-200">
      <p className="text-xs font-bold text-slate-500 uppercase mb-2">
        Past Tenancy Notes & History
      </p>
      {application.past_tenancy_notes &&
      application.past_tenancy_notes.length > 0 ? (
        <ul className="space-y-2">
          {application.past_tenancy_notes.map((note, idx) => (
            <li
              key={note.id || idx}
              className="text-xs bg-white p-2 rounded border border-slate-100"
            >
              <span className="font-bold text-slate-600">[{note.type}]</span>{" "}
              {note.content}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-600 italic bg-blue-50 p-3 rounded border border-blue-100">
          No prior tenancy history or notes found. This is a new applicant.
        </p>
      )}
    </div>
  );

  const renderApplicationSummary = () => {
    const type = application.application_type;

    // --- TRANSFER UI ---
    if (type === "transfer") {
      return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="text-blue-600">🔄</span> Transfer Request Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Tenant Name</p>
              <p className="font-medium text-slate-800">
                {application.applicant_name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Phone</p>
              <p className="font-medium text-slate-800">
                {application.applicant_phone}
              </p>
            </div>
            <div className="col-span-2 bg-white p-3 rounded border border-slate-100">
              <p className="text-xs text-slate-500 mb-1">Moving From</p>
              <p className="font-bold text-slate-800">
                {application.from_property_name || "Unknown"} -{" "}
                {application.from_unit_code || "N/A"}
              </p>
            </div>
            <div className="col-span-2 bg-green-50 p-3 rounded border border-green-100">
              <p className="text-xs text-green-700 mb-1">Moving To</p>
              <p className="font-bold text-green-800">
                {application.to_property_name || "Unknown"} -{" "}
                {application.to_unit_code || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Desired Move-in Date</p>
              <p className="font-medium text-slate-800">
                {application.desired_move_in_date || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Reason</p>
              <p className="font-medium text-slate-800">
                {application.transfer_reason || "No reason provided"}
              </p>
            </div>
          </div>
          {renderNotes()}
        </div>
      );
    }

    // --- TERMINATION UI ---
    if (type === "termination") {
      return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="text-red-600">🚪</span> Termination Request Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Tenant Name</p>
              <p className="font-medium text-slate-800">
                {application.applicant_name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Current Unit</p>
              <p className="font-medium text-slate-800">
                {application.property_name} - {application.unit_code}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Proposed Move-out Date</p>
              <p className="font-bold text-red-700">
                {application.proposed_move_out_date || "Immediate"}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Termination Type</p>
              <p className="font-medium text-slate-800 capitalize">
                {application.termination_type?.replace("_", " ") ||
                  "Tenant Request"}
              </p>
            </div>
            {application.penalty_amount && application.penalty_amount > 0 && (
              <div className="col-span-2 bg-red-50 p-3 rounded border border-red-100">
                <p className="text-xs text-red-700 mb-1">Penalty Fee</p>
                <p className="font-bold text-red-800 text-lg">
                  KES {application.penalty_amount.toLocaleString()}
                </p>
              </div>
            )}
            <div className="col-span-2">
              <p className="text-slate-500">Notes / Reason</p>
              <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-100">
                {application.termination_notes || "No notes provided"}
              </p>
            </div>
          </div>
          {renderNotes()}
        </div>
      );
    }

    // --- EXTENSION UI ---
    if (type === "extension") {
      return (
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
            <span className="text-green-600">📅</span> Extension Request Details
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-500">Tenant Name</p>
              <p className="font-medium text-slate-800">
                {application.applicant_name}
              </p>
            </div>
            <div>
              <p className="text-slate-500">Current Unit</p>
              <p className="font-medium text-slate-800">
                {application.property_name} - {application.unit_code}
              </p>
            </div>
            <div className="col-span-2 bg-green-50 p-3 rounded border border-green-100">
              <p className="text-xs text-green-700 mb-1">
                Requested New End Date
              </p>
              <p className="font-bold text-green-800 text-lg">
                {application.new_end_date || "Not specified"}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500">Reason for Extension</p>
              <p className="font-medium text-slate-800 bg-white p-2 rounded border border-slate-100">
                {application.extension_reason || "No reason provided"}
              </p>
            </div>
          </div>
          {renderNotes()}
        </div>
      );
    }

    // --- RENTAL UI (Default) ---
    return (
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
          <span className="text-primary">🏠</span> Rental Application Details
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Applicant Name</p>
            <p className="font-medium text-slate-800">
              {application.applicant_name}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Phone</p>
            <p className="font-medium text-slate-800">
              {application.applicant_phone}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Property</p>
            <p className="font-medium text-slate-800">
              {application.property_name}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Unit</p>
            <p className="font-medium text-slate-800">
              {application.unit_code}
            </p>
          </div>
        </div>

        {application.financial_status && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs font-bold text-slate-500 uppercase mb-2">
              Financial Requirements
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2 rounded border border-slate-100">
                <p className="text-slate-500">Deposit</p>
                <p className="font-bold text-slate-800">
                  {application.financial_status.deposit_paid
                    ? "✅ Paid"
                    : application.financial_status.deposit_waived
                      ? "🎁 Waived"
                      : "⏳ Pending"}
                </p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <p className="text-slate-500">Service Charge</p>
                <p className="font-bold text-slate-800">
                  {application.financial_status.service_charge_paid
                    ? "✅ Paid"
                    : application.financial_status.service_charge_waived
                      ? "🎁 Waived"
                      : "⏳ Pending"}
                </p>
              </div>
              <div className="bg-white p-2 rounded border border-slate-100">
                <p className="text-slate-500">First Rent</p>
                <p className="font-bold text-slate-800">
                  {application.financial_status.rent_paid
                    ? "✅ Paid"
                    : application.financial_status.rent_waived
                      ? "🎁 Waived"
                      : "⏳ Pending"}
                </p>
              </div>
            </div>
          </div>
        )}
        {renderNotes()}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Review Application
            </h2>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded mt-1 inline-block">
              {application.application_type} Application
            </span>
          </div>
          <button
            onClick={onClose}
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

        <div className="p-6 space-y-6">
          {renderApplicationSummary()}

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Decision
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDecision("approved")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${decision === "approved" ? "border-green-500 bg-green-50 text-green-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                ✅ Approve
              </button>
              <button
                type="button"
                onClick={() => setDecision("rejected")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${decision === "rejected" ? "border-red-500 bg-red-50 text-red-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={() => setDecision("escalated")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${decision === "escalated" ? "border-amber-500 bg-amber-50 text-amber-700" : "border-slate-200 text-slate-500 hover:border-slate-300"}`}
              >
                ⬆️ Escalate
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Reason / Remarks{" "}
              {decision !== "approved" && (
                <span className="text-red-500">*</span>
              )}
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="Add any remarks or reasons for your decision..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 flex justify-end gap-3 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              "Submit Decision"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
