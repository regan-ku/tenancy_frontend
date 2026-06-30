"use client";

import React, { useState } from "react";
import apiClient from "@/api/axios";
import { Unit } from "@/api/agencyUnitManagement.api";
import { validateEmail, validatePhone } from "@/utils/validation";

interface TenantCreationResult {
  id: number;
  full_name: string;
  email: string;
  phone_number: string;
}

interface AddTenantModalProps {
  unit: Unit;
  onClose: () => void;
  onSuccess: (data: TenantCreationResult) => void;
}

type LookupStatus =
  | "idle"
  | "loading"
  | "new_user"
  | "existing_incomplete"
  | "existing_complete"
  | "existing_agency";

export default function AddTenantModal({
  unit,
  onClose,
  onSuccess,
}: AddTenantModalProps) {
  const [step, setStep] = useState<"lookup" | "form">("lookup");
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const [existingUser, setExistingUser] = useState<any>(null);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const [query, setQuery] = useState("");

  // Form States
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [nationality, setNationality] = useState("Kenyan");
  const [address, setAddress] = useState("");
  const [dob, setDob] = useState("");

  const [nokName, setNokName] = useState("");
  const [nokRelationship, setNokRelationship] = useState("spouse");
  const [nokPhone, setNokPhone] = useState("");
  const [nokCity, setNokCity] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // ✅ 1. SMART LOOKUP LOGIC
  const handleLookup = async () => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Please enter an email address or phone number.");
      return;
    }

    const isEmail = trimmedQuery.includes("@");
    let payload: any = {};

    // Validate using enterprise utilities
    if (isEmail) {
      const validation = validateEmail(trimmedQuery);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      payload.email = validation.formattedValue || trimmedQuery.toLowerCase();
    } else {
      const validation = validatePhone(trimmedQuery);
      if (!validation.isValid) {
        setError(validation.message);
        return;
      }
      payload.phone_number = validation.formattedValue || trimmedQuery;
    }

    setError("");
    setLookupStatus("loading");

    try {
      const response = await apiClient.post(
        "/accounts/applicant-management/lookup/",
        payload,
      );

      const data = response.data;
      setLookupStatus(data.status);

      if (data.user) {
        setExistingUser(data.user);
        setMissingFields(data.missing_fields || []);

        if (data.user.full_name) setFullName(data.user.full_name);
        if (data.user.email) setEmail(data.user.email);
        if (data.user.phone_number) setPhone(data.user.phone_number);
      } else if (data.status === "new_user") {
        if (isEmail) {
          setEmail(payload.email);
        } else {
          setPhone(payload.phone_number);
        }
      }

      setStep("form");
    } catch (err: any) {
      console.error("Lookup failed:", err);
      const errData = err?.response?.data;
      if (errData && errData.non_field_errors) {
        setError(errData.non_field_errors[0]);
      } else {
        setError("Failed to check applicant. Please try again.");
      }
      setLookupStatus("idle");
    }
  };

  // ✅ 2. FINAL SUBMISSION LOGIC
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🛑 SAFETY GUARD: Prevent submission if we are still on the lookup step
    if (step === "lookup") {
      return;
    }

    if (lookupStatus === "new_user" && !email) {
      setError("An email address is required to create a new tenant account.");
      return;
    }

    setIsSaving(true);
    setError("");

    // If existing complete or agency, just pass the existing user's data to proceed
    if (
      (lookupStatus === "existing_complete" ||
        lookupStatus === "existing_agency") &&
      existingUser
    ) {
      onSuccess({
        id: existingUser.id,
        full_name: existingUser.full_name || fullName,
        email: existingUser.email || email,
        phone_number: existingUser.phone_number || phone,
      });
      setIsSaving(false);
      return;
    }

    const payload = {
      tenant_data: { email, phone_number: phone },
      profile_data: {
        full_name: fullName,
        national_id: nationalId,
        nationality,
        address,
        date_of_birth: dob || null,
      },
      next_of_kin_data: {
        full_name: nokName,
        relationship: nokRelationship,
        phone_number: nokPhone,
        city: nokCity,
      },
    };

    try {
      const response = await apiClient.post(
        "/accounts/manager-tenants/create/",
        payload,
      );
      const newTenantId = response.data.tenant_id;

      onSuccess({
        id: newTenantId,
        full_name: fullName || existingUser?.full_name,
        email: email || existingUser?.email,
        phone_number: phone || existingUser?.phone_number,
      });
    } catch (err: any) {
      console.error("Tenant creation/update failed:", err);
      const errData = err?.response?.data;
      let errorMsg = "Failed to process applicant. Please check the fields.";
      if (errData) {
        if (errData.tenant_data)
          errorMsg = Object.values(errData.tenant_data).join(" ");
        else if (errData.profile_data)
          errorMsg = Object.values(errData.profile_data).join(" ");
        else if (errData.next_of_kin_data)
          errorMsg = Object.values(errData.next_of_kin_data).join(" ");
        else if (errData.error) errorMsg = errData.error;
        else if (errData.detail) errorMsg = errData.detail;
      }
      setError(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const getModalTitle = () => {
    if (step === "lookup") return "Identify Applicant";
    if (lookupStatus === "new_user") return "Add New Tenant";
    if (lookupStatus === "existing_incomplete")
      return "Complete Tenant Profile";
    if (lookupStatus === "existing_complete") return "Confirm Applicant";
    if (lookupStatus === "existing_agency") return "Confirm Agency Applicant";
    return "Add Tenant";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              {getModalTitle()}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Unit: <strong>{unit.unit_code}</strong> • Rent: KES{" "}
              {Number(unit.rent_amount).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
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

          {/* ✅ STEP 1: UNIFIED SMART LOOKUP */}
          {step === "lookup" && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800">
                ℹ️ Enter the applicant's email address or phone number to check
                if they already exist in the system.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Email or Phone Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setError("");
                    }}
                    // 🛑 CRITICAL FIX: Prevent Enter key from submitting the form
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleLookup();
                      }
                    }}
                    className="w-full px-4 py-3 pl-10 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                    placeholder="e.g., john@gmail.com or 0712345678"
                    autoFocus
                  />
                  <svg
                    className="w-5 h-5 text-slate-400 absolute left-3 top-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  We'll automatically validate the format. Press Enter to
                  search.
                </p>
              </div>
            </div>
          )}

          {/* STEP 2: FORM / CONFIRMATION */}
          {step === "form" && (
            <>
              {/* NEW USER: Full Form */}
              {lookupStatus === "new_user" && (
                <div className="space-y-6">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                    ✅ New Applicant. Please fill in all details to create their
                    account and tenant profile.
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                      1. Account Credentials
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                      2. Profile Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          National ID{" "}
                          <span className="text-slate-400 font-normal normal-case">
                            (Optional)
                          </span>
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          value={nationalId}
                          onChange={(e) => setNationalId(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Nationality *
                        </label>
                        <input
                          type="text"
                          required
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Physical Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                      3. Next of Kin
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={nokName}
                          onChange={(e) => setNokName(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Relationship *
                        </label>
                        <select
                          required
                          value={nokRelationship}
                          onChange={(e) => setNokRelationship(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                        >
                          <option value="spouse">Spouse</option>
                          <option value="parent">Parent</option>
                          <option value="sibling">Sibling</option>
                          <option value="child">Child</option>
                          <option value="relative">Relative</option>
                          <option value="friend">Friend</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          required
                          value={nokPhone}
                          onChange={(e) => setNokPhone(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          City *
                        </label>
                        <input
                          type="text"
                          required
                          value={nokCity}
                          onChange={(e) => setNokCity(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* EXISTING INCOMPLETE */}
              {lookupStatus === "existing_incomplete" && (
                <div className="space-y-6">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-amber-800">
                      User Found: {existingUser?.full_name}
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      This user's tenant profile is incomplete. Please fill in
                      the missing legal details below.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        readOnly
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        readOnly
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        readOnly
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {missingFields.includes("nationality") && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Nationality *
                        </label>
                        <input
                          type="text"
                          required
                          value={nationality}
                          onChange={(e) => setNationality(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    )}
                    {missingFields.includes("address") && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Physical Address *
                        </label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    )}
                    {missingFields.includes("date_of_birth") && (
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                          Date of Birth *
                        </label>
                        <input
                          type="date"
                          required
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>
                    )}
                  </div>
                  {missingFields.includes("next_of_kin") && (
                    <div className="md:col-span-2">
                      <h4 className="text-sm font-bold text-slate-700 mb-3 border-b border-slate-100 pb-1">
                        Next of Kin
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Full Name *
                          </label>
                          <input
                            type="text"
                            required
                            value={nokName}
                            onChange={(e) => setNokName(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Relationship *
                          </label>
                          <select
                            required
                            value={nokRelationship}
                            onChange={(e) => setNokRelationship(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
                          >
                            <option value="spouse">Spouse</option>
                            <option value="parent">Parent</option>
                            <option value="sibling">Sibling</option>
                            <option value="child">Child</option>
                            <option value="relative">Relative</option>
                            <option value="friend">Friend</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            Phone Number *
                          </label>
                          <input
                            type="tel"
                            required
                            value={nokPhone}
                            onChange={(e) => setNokPhone(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                            City *
                          </label>
                          <input
                            type="text"
                            required
                            value={nokCity}
                            onChange={(e) => setNokCity(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* EXISTING COMPLETE */}
              {lookupStatus === "existing_complete" && (
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm font-semibold text-green-800">
                      ✅ User Found & Verified: {existingUser?.full_name}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      Email: {existingUser?.email} | Phone:{" "}
                      {existingUser?.phone_number}
                    </p>
                    <p className="text-xs text-green-700 mt-2">
                      This user's profile is complete. Click "Proceed to
                      Application" to start their rental application for this
                      unit.
                    </p>
                  </div>
                </div>
              )}

              {/* EXISTING AGENCY */}
              {lookupStatus === "existing_agency" && (
                <div className="p-6 space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-semibold text-blue-800">
                      🏢 Agency Found: {existingUser?.full_name}
                    </p>
                    <p className="text-xs text-blue-700 mt-1">
                      Email: {existingUser?.email} | Phone:{" "}
                      {existingUser?.phone_number}
                    </p>
                    <p className="text-xs text-blue-700 mt-2">
                      This is a corporate applicant. The application will be
                      linked to this agency account. Click "Proceed to
                      Application" to continue.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-3 sticky bottom-0">
          {step === "form" && lookupStatus !== "new_user" && (
            <button
              type="button"
              onClick={() => {
                setStep("lookup");
                setLookupStatus("idle");
                setError("");
              }}
              className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
            >
              &larr; Back to Lookup
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>

          {step === "lookup" ? (
            <button
              type="button"
              onClick={handleLookup}
              disabled={lookupStatus === "loading"}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {lookupStatus === "loading" ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Checking...
                </>
              ) : (
                "Check Applicant"
              )}
            </button>
          ) : (
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex-1 py-2.5 bg-primary text-white font-bold rounded-lg disabled:opacity-50 hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </>
              ) : lookupStatus === "new_user" ? (
                "Create Tenant & Proceed"
              ) : (
                "Proceed to Application"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
