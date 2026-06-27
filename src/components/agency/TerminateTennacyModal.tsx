"use client";

import React, { useState } from "react";
import { TenantFinancialInfo } from "@/api/agencyUnitManagement.api";
import { tenanciesApi } from "@/api/tenancies.api";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

interface TerminateTenancyModalProps {
  tenant: TenantFinancialInfo;
  propertyId: number;
  onClose: () => void;
  onComplete: () => void;
}

export default function TerminateTenancyModal({
  tenant,
  propertyId,
  onClose,
  onComplete,
}: TerminateTenancyModalProps) {
  const [terminationDate, setTerminationDate] = useState("");
  const [reason, setReason] = useState("");
  const [terminationType, setTerminationType] = useState("landlord_request");
  const [penaltyApplied, setPenaltyApplied] = useState<string>("0");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!terminationDate) {
      setError("Please select a termination date");
      return;
    }

    if (!reason.trim()) {
      setError("Please provide a reason for termination");
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

      // ✅ FIXED: Send all termination fields at the ROOT level
      // The backend EvictionApplicationCreateSerializer expects these fields directly
      await apiClient.post(endpoints.APPLICATIONS.LIST, {
        application_type: "termination",
        applicant: tenant.tenant_id,
        property: tenantTenancy.property,
        unit: tenantTenancy.unit,
        unit_id: tenantTenancy.unit, // ✅ Backend also checks unit_id

        // ✅ Termination fields at ROOT level (not nested)
        termination_type: terminationType,
        intended_vacate_date: terminationDate, // ✅ Backend expects this field name
        reason_for_leaving: reason, // ✅ Backend expects this field name
        penalty_amount: parseFloat(penaltyApplied) || 0,
      });

      alert(
        "✅ Termination Application submitted! Please go to the Applications tab to Review & Decide.",
      );
      onComplete();
    } catch (err: any) {
      console.error("Failed to submit termination application:", err);

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

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            Initiate Termination
          </h3>
          <p className="text-sm text-slate-500 mt-1">
            {tenant.tenant_name} • Unit {tenant.unit_code}
          </p>
        </div>

        <div className="p-6 space-y-4">
          {/* ✅ UPDATED: Unified Workflow Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <svg
                className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"
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
                <p className="text-sm font-bold text-amber-800">
                  Unified Workflow: Creates an Application
                </p>
                <p className="text-xs text-amber-700 mt-1">
                  Submitting this will create a{" "}
                  <strong>Termination Application</strong>. You will need to go
                  to the <strong>Applications Tab</strong> to formally "Review &
                  Decide" and execute the termination.
                </p>
              </div>
            </div>
          </div>

          {/* Termination Type */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Termination Type <span className="text-red-500">*</span>
            </label>
            <select
              value={terminationType}
              onChange={(e) => setTerminationType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="landlord_request">Landlord Request</option>
              <option value="tenant_request">Tenant Request</option>
              <option value="breach">Breach of Contract</option>
              <option value="mutual">Mutual Agreement</option>
            </select>
          </div>

          {/* Move-Out Date */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Move-Out Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={terminationDate}
              onChange={(e) => setTerminationDate(e.target.value)}
              min={today}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              The date when the tenant will officially vacate the unit
            </p>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Reason for Termination <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g., Lease violation, property sale, tenant request..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
            />
          </div>

          {/* Penalty Applied */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
              Penalty Applied (KES)
            </label>
            <input
              type="number"
              value={penaltyApplied}
              onChange={(e) => setPenaltyApplied(e.target.value)}
              min="0"
              step="0.01"
              placeholder="0.00"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
            />
            <p className="text-xs text-slate-400 mt-1">
              Any early termination fees or damage deductions (optional)
            </p>
          </div>

          {/* Error Message */}
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
            disabled={isSubmitting}
            className="flex-1 px-6 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
