"use client";

import React, { useState } from "react";
import { tenantOperationsApi } from "@/api/tenantOperations";
import { PersonalTenancy } from "@/api/tenantDashboard.api";

interface NoticeToVacateModalProps {
  tenancy: PersonalTenancy;
  onClose: () => void;
}

export default function NoticeToVacateModal({
  tenancy,
  onClose,
}: NoticeToVacateModalProps) {
  // Default to 30 days from now (standard notice period)
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 30);
  const formattedDate = defaultDate.toISOString().split("T")[0];

  const [moveOutDate, setMoveOutDate] = useState(formattedDate);
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) return alert("Please provide a reason for vacating.");
    if (
      !confirm(
        "⚠️ Are you sure you want to submit a formal Notice to Vacate? This will initiate the move-out process and deposit inspection.",
      )
    )
      return;

    setIsSubmitting(true);
    try {
      await tenantOperationsApi.submitNoticeToVacate(
        tenancy.id,
        moveOutDate,
        reason,
      );
      alert(
        "✅ Notice to Vacate submitted successfully. The management will contact you regarding the move-out inspection.",
      );
      onClose();
    } catch (error) {
      alert("Failed to submit notice.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-red-50">
          <div>
            <h2 className="text-xl font-bold text-red-800">Notice to Vacate</h2>
            <p className="text-xs text-red-600 mt-1">
              Terminating: {tenancy.property_name} - Unit {tenancy.unit_code}
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
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-800">
            <strong>⚠️ Legal Notice:</strong> Submitting this notice starts your
            contractual notice period. Ensure you have cleared all arrears and
            prepared the unit for the final move-out inspection to guarantee
            your deposit refund.
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Proposed Move-Out Date
            </label>
            <input
              type="date"
              value={moveOutDate}
              onChange={(e) => setMoveOutDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Leaving
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Relocating for work, lease ending..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
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
            className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting Notice..." : "Submit Formal Notice"}
          </button>
        </div>
      </div>
    </div>
  );
}
