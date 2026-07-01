"use client";

import React, { useState } from "react";
import { AgencyStaffMember, agencyStaffApi } from "@/api/agencyStaff.api";

interface RevokeStaffModalProps {
  staff: AgencyStaffMember;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RevokeStaffModal({
  staff,
  onClose,
  onSuccess,
}: RevokeStaffModalProps) {
  const [reason, setReason] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [isRevoking, setIsRevoking] = useState(false);
  const [error, setError] = useState("");

  const handleRevoke = async () => {
    if (confirmText !== "REVOKE") {
      setError("Please type 'REVOKE' exactly to confirm.");
      return;
    }
    if (!reason.trim()) {
      setError("Please provide a reason for this revocation.");
      return;
    }

    setIsRevoking(true);
    setError("");

    try {
      await agencyStaffApi.deactivateStaff(staff.id, reason);
      onSuccess();
    } catch (err: any) {
      console.error("Failed to revoke staff", err);
      const errMsg =
        err.response?.data?.detail ||
        err.response?.data?.error ||
        "Failed to revoke staff member.";
      setError(errMsg);
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-red-50">
          <h2 className="text-xl font-bold text-red-800">
            Revoke Staff Access
          </h2>
          <p className="text-sm text-red-600 mt-1">
            This will permanently suspend <strong>{staff.full_name}</strong>{" "}
            from accessing the system. They will be immediately logged out.
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium flex items-center gap-2">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Revocation *
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
              placeholder="e.g., Employee terminated, Contract expired, Security breach..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Type <span className="text-red-600 font-mono">REVOKE</span> to
              confirm
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-mono tracking-widest"
              placeholder="REVOKE"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleRevoke}
            disabled={isRevoking || confirmText !== "REVOKE" || !reason.trim()}
            className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isRevoking ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Revoking...
              </>
            ) : (
              "Revoke Access"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
