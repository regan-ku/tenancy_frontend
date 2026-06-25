"use client";

import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  useApplicationWizardStore,
  ApplicationType,
} from "@/store/applicationWizard.store";
import { useAuthStore } from "@/store/auth.store";
import ApplicationWizardGuard from "@/guards/ApplicationwizardGuard";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

import { useWizardLock } from "@/hooks/useWizardLock";

import StepApplicationDetails from "@/modules/applications/wizard/steps/StepApplicationDetails";
import StepTermsAndSubmit from "@/modules/applications/wizard/steps/StepTermsAndSubmit";

function ApplicationWizardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const {
    currentStep,
    applicationType,
    setApplicationType,
    updateFormData,
    resetWizard,
    isSubmitting,
    wizardLocked, // ✅ ADDED: Extract the lock state
  } = useApplicationWizardStore();

  // ✅ Pass the dynamic lock state to the hook
  // When wizardLocked becomes false (after submission), the hook removes the browser event listeners.
  useWizardLock(wizardLocked);

  useEffect(() => {
    let type = searchParams.get("type") as ApplicationType | null;
    if (!type) {
      if (pathname.includes("/transfer")) type = "transfer";
      else if (pathname.includes("/eviction")) type = "eviction";
      else type = "rental";
    }
    if (type) setApplicationType(type);

    const propertyId = searchParams.get("property_id");
    const unitGroupId = searchParams.get("unit_group_id");

    const urlUpdates: any = {};
    if (propertyId) urlUpdates.propertyId = Number(propertyId);
    if (unitGroupId) urlUpdates.unitGroupId = Number(unitGroupId);

    if (Object.keys(urlUpdates).length > 0) {
      updateFormData(urlUpdates);
    }

    if (user) {
      const currentFormData = useApplicationWizardStore.getState().formData;
      const u = user as any;

      let fullName = u.full_name || u.profile?.full_name || u.name || "";
      let phone = u.phone_number || u.phone || u.profile?.phone_number || "";
      let email = u.email || u.profile?.email || "";

      if (!fullName || !phone || !email) {
        apiClient
          .get(endpoints.PROFILE.ME)
          .then((res) => {
            const profileData = res.data;
            const profileUpdates: any = {};

            if (!fullName && profileData.full_name)
              profileUpdates.full_name = profileData.full_name;
            if (!phone && profileData.phone_number)
              profileUpdates.phone_number = profileData.phone_number;
            if (!email && profileData.email)
              profileUpdates.email = profileData.email;

            if (Object.keys(profileUpdates).length > 0) {
              updateFormData(profileUpdates);
            }

            useAuthStore.getState().setUser({
              ...u,
              full_name: profileData.full_name || u.full_name,
              phone_number: profileData.phone_number || u.phone_number,
              email: profileData.email || u.email,
            });
          })
          .catch((err) => {
            if (err.response?.status !== 401) {
              console.error("Failed to fetch profile for wizard", err);
            }
          });
      } else {
        const profileUpdates: any = {};
        if (!currentFormData.full_name && fullName)
          profileUpdates.full_name = fullName;
        if (!currentFormData.phone_number && phone)
          profileUpdates.phone_number = phone;
        if (!currentFormData.email && email) profileUpdates.email = email;

        if (Object.keys(profileUpdates).length > 0) {
          updateFormData(profileUpdates);
        }
      }
    }
  }, [pathname, searchParams, user, setApplicationType, updateFormData]);

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel this application? Your draft will be lost.",
      )
    ) {
      resetWizard();
      router.push("/marketplace");
    }
  };

  const handleNextStep = () => {
    const store = useApplicationWizardStore.getState();

    if (currentStep === 1) {
      const errors: string[] = [];
      if (!store.formData.target_unit_id)
        errors.push("Please select a preferred floor/unit.");

      if (store.applicationType === "rental") {
        if (!store.formData.anticipated_move_in_date)
          errors.push("Move-in date is required.");
        if (!store.formData.employment_status)
          errors.push("Employment status is required.");
      } else if (store.applicationType === "transfer") {
        if (!store.formData.anticipated_move_out_date)
          errors.push("Current move-out date is required.");
        if (!store.formData.anticipated_move_in_date)
          errors.push("New move-in date is required.");
        if (!store.formData.reason)
          errors.push("Reason for transfer is required.");
      } else if (store.applicationType === "eviction") {
        if (!store.formData.anticipated_move_out_date)
          errors.push("Move-out date is required.");
        if (!store.formData.reason)
          errors.push("Reason for notice is required.");
      }

      if (errors.length > 0) {
        store.setShowStepValidation(true);
        alert("Please fill in all required fields:\n• " + errors.join("\n• "));
        return;
      }
    }

    store.setShowStepValidation(false);
    store.nextStep();
  };

  const totalSteps = 2;
  const progress = (currentStep / totalSteps) * 100;

  const getTitle = () => {
    switch (applicationType) {
      case "rental":
        return "Rental Application";
      case "transfer":
        return "Transfer Request";
      case "eviction":
        return "Eviction / Termination Notice";
      default:
        return "Application";
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepApplicationDetails />;
      case 2:
        return <StepTermsAndSubmit />;
      default:
        return <StepApplicationDetails />;
    }
  };

  return (
    <ApplicationWizardGuard>
      <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen flex flex-col">
          <div className="mb-8 flex-shrink-0">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-slate-800">
                {getTitle()}
              </h1>
              <button
                onClick={handleCancel}
                className="text-sm text-red-500 hover:text-red-700 font-bold flex items-center gap-2 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
                Exit Wizard
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(Math.min(progress, 100))}% Complete</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 flex-grow">
            {renderStep()}
          </div>

          <div className="flex justify-between mt-6 flex-shrink-0 pb-8">
            <button
              onClick={() => useApplicationWizardStore.getState().prevStep()}
              disabled={currentStep === 1 || isSubmitting}
              className="px-6 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium disabled:opacity-50"
            >
              &larr; Back
            </button>

            {currentStep < totalSteps && (
              <button
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="px-8 py-2 bg-blue-600 text-white rounded-lg font-medium disabled:opacity-70 flex items-center gap-2"
              >
                Next Step &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </ApplicationWizardGuard>
  );
}

export default function ApplicationWizardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-slate-500">
          Loading Wizard...
        </div>
      }
    >
      <ApplicationWizardContent />
    </Suspense>
  );
}
