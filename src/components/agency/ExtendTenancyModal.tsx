"use client";

import React, { useState } from "react";
import { TenantFinancialInfo } from "@/api/agencyUnitManagement.api";
import { tenanciesApi } from "@/api/tenancies.api";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

interface ExtendTenancyModalProps {
  tenant: TenantFinancialInfo;
  propertyId: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function ExtendTenancyModal({
  tenant,
  propertyId,
  onClose,
  onComplete,
}: ExtendTenancyModalProps) {
  const [newEndDate, setNewEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!newEndDate) {
      setError("Please select a new end date");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const tenancies = await tenanciesApi.getTenancies();
      const tenantTenancy = tenancies.find(
        (t: any) =>
          t.tenant === tenant.tenant_id &&
          t.unit_code === tenant.unit_code &&
          (t.status === "active" || t.status === "extended"),
      );

      if (!tenantTenancy) {
        throw new Error("Active tenancy not found");
      }

      // ✅ UNIFIED FLOW: Create an Application record
      // Sending fields at ROOT level ensures backend serializers can easily extract them
      await apiClient.post(endpoints.APPLICATIONS.LIST, {
        application_type: "extension",
        applicant: tenant.tenant_id,
        property: tenantTenancy.property,
        unit: tenantTenancy.unit,
        unit_id: tenantTenancy.unit, // Backend often checks unit_id

        // ✅ Extension fields at ROOT level
        new_end_date: newEndDate,
        reason: reason,

        // Keep nested structure for backward compatibility
        extension_details: {
          new_end_date: newEndDate,
          reason: reason,
        },
      });

      alert(
        "✅ Extension Application submitted! Please go to the Applications tab to Review & Decide.",
      );
      onComplete();
    } catch (err: any) {
      console.error("Failed to submit extension application:", err);

      // ✅ IMPROVED ERROR HANDLING
      if (err.response?.data) {
        const errors = Object.entries(err.response.data)
          .map(
            ([key, val]) =>
              `${key}: ${Array.isArray(val) ? val.join(", ") : val}`,
          )
          .join(" | ");
        setError(errors);
      } else {
        setError(err.message || "Failed to submit application");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate =
    tenant.tenancy_end_date || new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Initiate Extension
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {tenant.tenant_name} • Unit {tenant.unit_code}
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-bold text-green-800">
                  Unified Workflow: Creates an Application
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Submitting this will create an{" "}
                  <strong>Extension Application</strong>. You will need to go to
                  the <strong>Applications Tab</strong> to formally "Review &
                  Decide" and execute the extension.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-bold text-blue-800">
              Current End Date: {tenant.tenancy_end_date || "Not specified"}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Select a new end date to extend this tenancy.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              New End Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={newEndDate}
              onChange={(e) => setNewEndDate(e.target.value)}
              min={minDate}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Must be after the current end date
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Extension
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g., Tenant requested to stay longer, lease renewal..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !newEndDate}
            className="flex-1 px-6 py-2.5 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              "Submit Application"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
