"use client";

import React, { useState } from "react";
import {
  AgencyApplication,
  agencyOperationsApi,
} from "@/api/agencyOperations.api";

interface Props {
  application: AgencyApplication;
  onClose: () => void;
  onDecisionMade: () => void;
}

export default function AgencyApplicationReviewModal({
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
      await agencyOperationsApi.makeDecision(application.id, decision, reason);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-primary-dark">
            Review Application
          </h2>
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

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Application Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="font-bold text-slate-800 mb-2">Applicant Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
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

            {/* ✅ FIX: Tenant History Notes (Always visible, shows fallback for new tenants) */}
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
                      <span className="font-bold text-slate-600">
                        [{note.type}]
                      </span>{" "}
                      {note.content}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-600 italic bg-blue-50 p-3 rounded border border-blue-100">
                  No prior tenancy history or notes found. This is a new
                  applicant.
                </p>
              )}
            </div>
          </div>

          {/* Decision Form */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-3">
              Decision
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setDecision("approved")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${
                  decision === "approved"
                    ? "border-green-500 bg-green-50 text-green-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                ✅ Approve
              </button>
              <button
                type="button"
                onClick={() => setDecision("rejected")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${
                  decision === "rejected"
                    ? "border-red-500 bg-red-50 text-red-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                ❌ Reject
              </button>
              <button
                type="button"
                onClick={() => setDecision("escalated")}
                className={`p-3 rounded-lg border-2 text-sm font-bold transition-all ${
                  decision === "escalated"
                    ? "border-amber-500 bg-amber-50 text-amber-700"
                    : "border-slate-200 text-slate-500 hover:border-slate-300"
                }`}
              >
                ⬆️ Escalate
              </button>
            </div>
          </div>

          {/* Reason */}
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

        {/* Footer */}
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
