"use client";

import React, { useState } from "react";
import { tenantOperationsApi } from "@/api/tenantOperations";

interface RentalApplicationModalProps {
  preSelectedUnitId?: number;
  onClose: () => void;
}

export default function RentalApplicationModal({
  preSelectedUnitId,
  onClose,
}: RentalApplicationModalProps) {
  const [unitId, setUnitId] = useState(preSelectedUnitId?.toString() || "");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!unitId) return alert("Please select or enter a Unit ID.");
    setIsSubmitting(true);
    try {
      await tenantOperationsApi.submitRentalApplication(
        parseInt(unitId),
        message,
      );
      alert(
        "✅ Application submitted successfully! The property manager will review your profile.",
      );
      onClose();
    } catch (error) {
      alert("Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary/5">
          <h2 className="text-xl font-bold text-primary-dark">
            New Rental Application
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
            <strong>Note:</strong> Your profile, ID, and Next of Kin details
            will be automatically shared with the property manager for
            verification.
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Target Unit ID
            </label>
            <input
              type="text"
              value={unitId}
              onChange={(e) => setUnitId(e.target.value)}
              placeholder="e.g., 104"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Message to Manager (Optional)
            </label>
            <textarea
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g., I am interested in this unit and can provide a 6-month advance..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
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
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
