"use client";

import React, { useState } from "react";
import {
  AgencyApplication,
  agencyOperationsApi,
} from "@/api/agencyOperations.api";

interface AgencyApplicationReviewModalProps {
  application: AgencyApplication;
  onClose: () => void;
  onDecision: () => void;
}

export default function AgencyApplicationReviewModal({
  application,
  onClose,
  onDecision,
}: AgencyApplicationReviewModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDecision = async (
    decision: "approve" | "reject" | "escalate",
  ) => {
    setIsProcessing(true);
    try {
      await agencyOperationsApi.makeDecision(
        application.id,
        decision,
        "Processed via Agency Dashboard",
      );
      alert(
        `✅ Application ${decision === "escalate" ? "escalated to landlord" : decision + "d"} successfully.`,
      );
      onDecision();
    } catch (error) {
      alert("Failed to process application.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getNoteColor = (type: string) => {
    switch (type) {
      case "payment":
        return "border-l-green-500 bg-green-50";
      case "behavior":
        return "border-l-blue-500 bg-blue-50";
      case "maintenance":
        return "border-l-orange-500 bg-orange-50";
      default:
        return "border-l-slate-400 bg-slate-50";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Review Rental Application
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Applicant: {application.applicant_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
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

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Application Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Target Unit
              </p>
              <p className="font-bold text-slate-800">
                {application.unit_code} • {application.property_name}
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-xs text-slate-400 uppercase font-bold">
                Property Owner
              </p>
              <p className="font-bold text-slate-800">
                {application.landlord_name}
              </p>
            </div>
          </div>

          {/* ✅ CRITICAL: TENANCY HISTORY & NOTES */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Historical Tenancy Intelligence
            </h3>
            {application.past_tenancy_notes.length > 0 ? (
              <div className="space-y-2">
                {application.past_tenancy_notes.map((note) => (
                  <div
                    key={note.id}
                    className={`p-3 rounded-lg border-l-4 text-sm ${getNoteColor(note.type)}`}
                  >
                    <div className="flex justify-between mb-1">
                      <span className="text-xs font-bold uppercase text-slate-600">
                        {note.type}
                      </span>
                      <span className="text-xs text-slate-400">
                        {note.date} • {note.author}
                      </span>
                    </div>
                    <p className="text-slate-700">{note.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm italic text-center py-4">
                No previous tenancy records found (First-time applicant).
              </p>
            )}
          </div>

          {/* Delegation Warning */}
          {!application.agency_can_approve && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-sm font-bold text-yellow-800">
                  Partial Delegation Active
                </p>
                <p className="text-xs text-yellow-700 mt-0.5">
                  Your agency has "Review Only" permissions for this property.
                  You cannot approve or reject this application directly. You
                  must escalate it to the landlord for final decision.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row justify-end gap-3">
          {application.agency_can_approve ? (
            <>
              <button
                onClick={() => handleDecision("reject")}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 disabled:opacity-50"
              >
                Reject Application
              </button>
              <button
                onClick={() => handleDecision("approve")}
                disabled={isProcessing}
                className="px-8 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50"
              >
                Approve & Create Tenancy
              </button>
            </>
          ) : (
            <button
              onClick={() => handleDecision("escalate")}
              disabled={isProcessing}
              className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 justify-center"
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
              Escalate to Landlord
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
