"use client";

import React, { useState } from "react";
import { tenantOperationsApi } from "@/api/tenantOperations";
import { PersonalTenancy } from "@/api/tenantDashboard.api";

interface TransferRequestModalProps {
  tenancy: PersonalTenancy;
  onClose: () => void;
}

export default function TransferRequestModal({
  tenancy,
  onClose,
}: TransferRequestModalProps) {
  const [targetUnitId, setTargetUnitId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!targetUnitId || !reason.trim())
      return alert("Please provide a target unit and a reason.");
    setIsSubmitting(true);
    try {
      await tenantOperationsApi.submitTransferRequest(
        tenancy.id,
        parseInt(targetUnitId),
        reason,
      );
      alert("✅ Transfer request submitted! Awaiting manager approval.");
      onClose();
    } catch (error) {
      alert("Failed to submit transfer request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-blue-50">
          <div>
            <h2 className="text-xl font-bold text-blue-800">
              Request Unit Transfer
            </h2>
            <p className="text-xs text-blue-600 mt-1">
              From: {tenancy.property_name} - Unit {tenancy.unit_code}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-xs text-yellow-800">
            <strong>⚠️ Transfer Rules:</strong> Transfers are subject to unit
            availability and manager approval. Your current lease terms may be
            adjusted to match the new unit's pricing.
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Target Unit ID (Destination)
            </label>
            <input
              type="text"
              value={targetUnitId}
              onChange={(e) => setTargetUnitId(e.target.value)}
              placeholder="Enter available Unit ID"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Transfer
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Growing family, need an extra bedroom..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Transfer Request"}
          </button>
        </div>
      </div>
    </div>
  );
}
