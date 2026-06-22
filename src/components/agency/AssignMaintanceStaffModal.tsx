"use client";

import React, { useState } from "react";
import {
  agencyMaintenanceApi,
  AgencyMaintenanceRequest,
  AgencyStaffOption,
} from "@/api/agencyMaintance.api";

interface AssignMaintenanceStaffModalProps {
  request: AgencyMaintenanceRequest;
  staffOptions: AgencyStaffOption[];
  onClose: () => void;
  onSuccess: (requestId: string, staffId: number, staffName: string) => void;
}

export default function AssignMaintenanceStaffModal({
  request,
  staffOptions,
  onClose,
  onSuccess,
}: AssignMaintenanceStaffModalProps) {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [internalNotes, setInternalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssign = async () => {
    if (!selectedStaffId)
      return alert("Please select a staff member to assign.");

    setIsSubmitting(true);
    try {
      await agencyMaintenanceApi.assignStaff(
        request.id,
        selectedStaffId,
        internalNotes,
      );
      const selectedStaff = staffOptions.find((s) => s.id === selectedStaffId);
      if (selectedStaff) {
        onSuccess(request.id, selectedStaff.id, selectedStaff.full_name);
      }
    } catch (error) {
      alert("Failed to assign staff. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-primary/5">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Dispatch Agency Staff
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Assign an internal team member to resolve this issue.
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
        <div className="p-6 space-y-5">
          {/* Context Summary */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Property:</span>
              <span className="font-bold text-slate-800">
                {request.property_name} ({request.unit_code})
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Issue:</span>
              <span className="font-bold text-slate-800">{request.title}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Landlord:</span>
              <span className="font-medium text-slate-600">
                {request.landlord_name}
              </span>
            </div>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
              Select Caretaker / Technician
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {staffOptions.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    selectedStaffId === staff.id
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-slate-800 text-sm">
                      {staff.full_name}
                    </p>
                    <p className="text-xs text-slate-500">{staff.role}</p>
                  </div>
                  {selectedStaffId === staff.id && (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Internal Notes for Staff (Optional)
            </label>
            <textarea
              rows={3}
              value={internalNotes}
              onChange={(e) => setInternalNotes(e.target.value)}
              placeholder="e.g., Bring a 1-inch wrench, the tenant will be home after 4 PM..."
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={isSubmitting || !selectedStaffId}
            className="px-8 py-2.5 bg-primary text-white font-bold rounded-lg shadow-md hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>{" "}
                Dispatching...
              </>
            ) : (
              "🚀 Dispatch Staff"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
