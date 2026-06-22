"use client";

import React, { useEffect } from "react";
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";
import { useAuthStore } from "@/store/auth.store";

export default function StepPersonalOrBusinessInfo() {
  const { formData, updateFormData, userRole } = useOnboardingWizardStore();
  const { user } = useAuthStore();
  const isTenant = userRole === "tenant";
  const isAgency = userRole === "agency";

  useEffect(() => {
    if (user) {
      const updates: Partial<typeof formData> = {};
      const userPhone = (user as any).phone_number || (user as any).phone;
      if (userPhone && formData.phone_number === "+254")
        updates.phone_number = userPhone;
      if (Object.keys(updates).length > 0) updateFormData(updates);
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
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
            : "Provide your personal details. Phone number is auto-filled."}
        </p>
      </div>

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
                pattern="^[a-zA-Z\s\-']{2,60}$"
                title="Letters, spaces, and hyphens only (2-60 chars)"
                maxLength={60}
                placeholder="e.g., Sunrise Properties Ltd"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                pattern="^[A-Za-z0-9\-]{5,30}$"
                title="5-30 alphanumeric characters"
                maxLength={30}
                placeholder="e.g., PVT-XXXXXX"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                placeholder="e.g., info@sunrise.co.ke"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                required
                pattern="^[a-zA-Z\s\-']{2,60}$"
                title="Letters, spaces, and hyphens only (2-60 chars)"
                maxLength={60}
                placeholder="e.g., John Doe"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                pattern="^[A-Za-z0-9]{6,20}$"
                title="6-20 alphanumeric characters"
                maxLength={20}
                placeholder={
                  isTenant ? "Optional for tenants" : "e.g., 12345678"
                }
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
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
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Nationality *
              </label>
              <input
                type="text"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                required
                pattern="^[a-zA-Z\s\-']{2,60}$"
                title="Letters only"
                maxLength={60}
                placeholder="e.g., Kenyan"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </>
        )}

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            {isAgency ? "Business Phone Number" : "Personal Phone Number"} *
          </label>
          <input
            type="tel"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            required
            pattern="^(\+254|254|0)[17]\d{8}$"
            title="Format: +254712345678 or 0712345678"
            maxLength={15}
            placeholder="e.g., +254712345678"
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none bg-slate-50"
          />
          <p className="text-xs text-slate-500 mt-1">
            Must be exactly 10 digits (starting with 0) or 13 characters
            (starting with +254).
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Physical Address *
          </label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={3}
            minLength={5}
            placeholder={
              isAgency
                ? "Registered business address..."
                : "Your current residential address..."
            }
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary outline-none resize-none"
          />
        </div>
      </div>
    </div>
  );
}
