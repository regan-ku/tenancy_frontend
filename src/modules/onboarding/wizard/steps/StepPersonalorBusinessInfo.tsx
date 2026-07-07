"use client";

import React from "react";
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";
import { useAuthStore } from "@/store/auth.store";

export default function StepPersonalOrBusinessInfo() {
  const { formData, updateFormData, userRole } = useOnboardingWizardStore();
  const { user } = useAuthStore();

  const isTenant = userRole === "tenant";
  const isAgency = userRole === "agency";

  // ✅ Detect if user is Staff to show a badge (NO LOCKING)
  const isStaff = user?.role === "agent" || user?.role === "caretaker";

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  // ✅ Helper to render a "Pre-filled" badge
  const renderPrefilledBadge = (fieldName: string) => {
    const value = (formData as any)[fieldName];
    if (value && value !== "+254") {
      return (
        <span className="ml-2 text-[10px] font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
          Pre-filled
        </span>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          {isAgency ? "Business Information" : "Personal Information"}
        </h2>
        <p className="text-slate-500">
          {isAgency
            ? "Provide your registered business details."
            : isStaff
              ? "Your core identity details are managed by your agency. Please complete the remaining legal tenant fields."
              : "Provide your personal details. Phone number is auto-filled."}
        </p>
      </div>

      {isStaff && !isAgency && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 flex items-center gap-2">
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          As a staff member, your Name and Phone Number are managed by your
          agency.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isAgency ? (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Registered Business Name *
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Sunrise Properties Ltd"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Business Registration Number *
              </label>
              <input
                type="text"
                name="registration_number"
                value={formData.registration_number}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., PVT-XXXXXX"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Business Email *
              </label>
              <input
                type="email"
                name="business_email"
                value={formData.business_email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., info@sunrise.co.ke"
              />
            </div>
          </>
        ) : (
          <>
            {/* Full Name Field - NO LOCKING */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Legal Name *{renderPrefilledBadge("full_name")}
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                National ID / Passport Number{" "}
                {isTenant ? (
                  <span className="text-slate-400 font-normal">(Optional)</span>
                ) : (
                  " *"
                )}
              </label>
              <input
                type="text"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
                required={!isTenant}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder={
                  isTenant ? "Optional for tenants" : "e.g., 12345678"
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                name="date_of_birth"
                value={formData.date_of_birth}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nationality *{renderPrefilledBadge("nationality")}
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
                placeholder="e.g., Kenyan"
              />
            </div>
          </>
        )}

        {/* Phone Number Field - NO LOCKING */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isAgency ? "Business Phone Number" : "Personal Phone Number"} *
            {renderPrefilledBadge("phone_number")}
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
            placeholder="e.g., +254712345678"
          />
          <p className="text-xs text-slate-500 mt-1">
            Must be exactly 10 digits (starting with 0) or 13 characters
            (starting with +254).
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Physical Address *{renderPrefilledBadge("address")}
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
            placeholder={
              isAgency
                ? "Registered business address..."
                : "Your current residential address..."
            }
          />
        </div>
      </div>
    </div>
  );
}
