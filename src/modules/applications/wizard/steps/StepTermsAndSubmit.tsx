"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApplicationWizardStore } from "@/store/applicationWizard.store";
import { useAuthStore } from "@/store/auth.store";
import { applicationsApi, TenantHistorySummary } from "@/api/applications.api";
import { propertiesApi } from "@/api/properties.api";

export default function StepTermsAndSubmit() {
  const router = useRouter();
  const { user } = useAuthStore();
  const {
    applicationType,
    formData,
    termsAccepted,
    updateFormData,
    setSubmitting,
    isSubmitting,
    error,
    resetWizard,
  } = useApplicationWizardStore();

  const [unitDetails, setUnitDetails] = useState<any>(null);
  const [tenantHistory, setTenantHistory] =
    useState<TenantHistorySummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ AUTO-POPULATE: Fetch Unit Details & Tenant History on mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Fetch Unit Details (Now using propertyId and target_unit_id)
        if (formData.target_unit_id && formData.propertyId) {
          const unitData = await propertiesApi.getUnitById(
            formData.propertyId,
            formData.target_unit_id,
          );
          setUnitDetails(unitData);
        }

        // 2. Fetch Tenant History (if user is logged in and has an ID)
        if (user?.id) {
          const historyData = await applicationsApi.getTenantHistorySummary(
            user.id,
          );
          setTenantHistory(historyData);
        }
      } catch (err) {
        console.error("Failed to fetch review data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [formData.target_unit_id, formData.propertyId, user?.id]);

  const handleSubmit = async () => {
    if (!termsAccepted) {
      alert("Please accept the Terms and Conditions to proceed.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = new FormData();

      // Append all text fields from the wizard
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          payload.append(key, String(value));
        }
      });

      // Append application metadata explicitly
      if (applicationType) payload.append("application_type", applicationType);
      if (formData.target_unit_id)
        payload.append("target_unit_id", String(formData.target_unit_id));
      if (formData.current_unit_id)
        payload.append("current_unit_id", String(formData.current_unit_id));

      // Submit to backend
      await applicationsApi.submitApplication(payload);

      // Success: Reset wizard and redirect
      resetWizard();

      // Redirect based on role
      if (user?.role === "tenant") {
        router.push("/dashboard/tenant");
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      console.error("Application submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Review & Submit Application
        </h2>
        <p className="text-slate-500">
          Please review your application details and historical records below
          before submitting.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      {/* ✅ 1. TENANT HISTORY & NOTES (Passed to Manager) */}
      {tenantHistory && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-4">
          <h3 className="font-bold text-primary-dark flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
              />
            </svg>
            Your Tenancy History (Visible to Property Manager)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-500 uppercase">Past Tenancies</p>
              <p className="font-semibold text-slate-800">
                {tenantHistory.total_past_tenancies}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">
                Avg. Stay Duration
              </p>
              <p className="font-semibold text-slate-800">
                {tenantHistory.average_stay_duration_months} Months
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">
                Payment Reliability
              </p>
              <p
                className={`font-semibold ${tenantHistory.payment_reliability_score === "Excellent" ? "text-green-600" : "text-amber-600"}`}
              >
                {tenantHistory.payment_reliability_score}
              </p>
            </div>
          </div>

          {tenantHistory.notes.length > 0 && (
            <div className="mt-3 pt-3 border-t border-blue-200">
              <p className="text-xs font-semibold text-slate-600 mb-2">
                Manager Notes on File:
              </p>
              <ul className="space-y-2">
                {tenantHistory.notes.slice(0, 3).map((note, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-slate-700 bg-white p-2 rounded border border-blue-100"
                  >
                    <span className="font-medium text-xs uppercase text-slate-500 mr-2">
                      [{note.note_type}]
                    </span>
                    {note.content}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {tenantHistory.notes.length === 0 &&
            tenantHistory.total_past_tenancies === 0 && (
              <p className="text-sm text-slate-600 italic mt-2">
                No prior tenancy history found. You are applying as a new
                tenant.
              </p>
            )}
        </div>
      )}

      {/* ✅ 2. UNIT & APPLICATION SUMMARY */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-4">
        <h3 className="font-bold text-primary-dark">Application Summary</h3>

        {/* Unit Details */}
        {unitDetails && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs text-slate-500 uppercase">Property</p>
              <p className="font-semibold text-slate-800">
                {unitDetails.property_title || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Unit Code</p>
              <p className="font-semibold text-slate-800">
                {unitDetails.unit_code || `Unit #${formData.target_unit_id}`}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Rent Amount</p>
              <p className="font-semibold text-secondary">
                KES {Number(unitDetails.rent_amount || 0).toLocaleString()}/
                {unitDetails.billing_cycle}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Deposit</p>
              <p className="font-semibold text-slate-800">
                KES {Number(unitDetails.deposit_amount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Applicant Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-slate-500 uppercase">Applicant Name</p>
            <p className="font-medium">
              {formData.full_name || "Not provided"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Phone Number</p>
            <p className="font-medium">
              {formData.phone_number || "Not provided"}
            </p>
          </div>

          {/* Conditional Summary Fields */}
          {applicationType === "rental" && (
            <>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Anticipated Move-In
                </p>
                <p className="font-medium">
                  {formData.anticipated_move_in_date || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Employment Status
                </p>
                <p className="font-medium capitalize">
                  {formData.employment_status?.replace("_", " ") ||
                    "Not specified"}
                </p>
              </div>
            </>
          )}

          {applicationType === "transfer" && (
            <>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Move-Out Date
                </p>
                <p className="font-medium">
                  {formData.anticipated_move_out_date || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase">Move-In Date</p>
                <p className="font-medium">
                  {formData.anticipated_move_in_date || "Not specified"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 uppercase">
                  Reason for Transfer
                </p>
                <p className="font-medium">
                  {formData.reason || "Not specified"}
                </p>
              </div>
            </>
          )}

          {applicationType === "eviction" && (
            <>
              <div>
                <p className="text-xs text-slate-500 uppercase">
                  Termination Date
                </p>
                <p className="font-medium">
                  {formData.anticipated_move_out_date || "Not specified"}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-slate-500 uppercase">
                  Reason for Notice
                </p>
                <p className="font-medium">
                  {formData.reason || "Not specified"}
                </p>
              </div>
            </>
          )}

          {formData.notes && (
            <div className="md:col-span-2">
              <p className="text-xs text-slate-500 uppercase">
                Additional Notes
              </p>
              <p className="font-medium text-slate-700 italic">
                "{formData.notes}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ✅ 3. Terms and Conditions */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <input
          type="checkbox"
          id="termsAccepted"
          checked={termsAccepted}
          onChange={(e) =>
            updateFormData({ termsAccepted: e.target.checked } as any)
          }
          className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary"
        />
        <label
          htmlFor="termsAccepted"
          className="text-sm text-amber-800 cursor-pointer"
        >
          I confirm that the information provided is accurate and complete. I
          agree to the platform's Terms of Service and authorize the property
          manager to verify my application details, including my tenancy
          history. I understand that submitting this application does not
          guarantee approval.
        </label>
      </div>

      {/* ✅ 4. Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !termsAccepted}
        className="w-full btn-primary py-4 text-lg font-bold shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Submitting Application...
          </>
        ) : (
          "🚀 Submit Application"
        )}
      </button>
    </div>
  );
}
