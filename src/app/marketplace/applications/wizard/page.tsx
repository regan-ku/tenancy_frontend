"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useApplicationWizardStore,
  ApplicationType,
} from "@/store/applicationWizard.store";
import { useAuthStore } from "@/store/auth.store";
import ApplicationWizardGuard from "@/guards/ApplicationwizardGuard";

// Step Components
import StepApplicationDetails from "@/modules/applications/wizard/steps/StepApplicationDetails";
import StepTermsAndSubmit from "@/modules/applications/wizard/steps/StepTermsAndSubmit";

export default function ApplicationWizardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();

  const {
    currentStep,
    applicationType,
    setApplicationType,
    updateFormData,
    resetWizard,
    isSubmitting,
  } = useApplicationWizardStore();

  // Initialize wizard from URL params and auto-populate profile data
  useEffect(() => {
    const type = searchParams.get("type") as ApplicationType | null;
    const propertyId = searchParams.get("property");
    const unitGroupId = searchParams.get("unit_group");

    if (type) setApplicationType(type);
    if (propertyId) updateFormData({ propertyId: Number(propertyId) });
    if (unitGroupId) updateFormData({ unitGroupId: Number(unitGroupId) });

    // Auto-populate from Auth Store
    if (user && !useApplicationWizardStore.getState().formData.full_name) {
      updateFormData({
        full_name: (user as any).full_name || "",
        phone_number: (user as any).phone_number || (user as any).phone || "",
        email: (user as any).email || "",
      });
    }
  }, [searchParams, user, setApplicationType, updateFormData]);

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

  // ✅ UPDATED: Now a streamlined 2-step wizard
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
      <div className="min-h-screen bg-surface-muted py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header & Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-primary-dark">
                {getTitle()}
              </h1>
              <button
                onClick={handleCancel}
                className="text-sm text-slate-500 hover:text-red-500 font-medium"
              >
                Cancel Application
              </button>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-secondary h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs font-medium text-slate-500">
              <span>
                Step {currentStep} of {totalSteps}
              </span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[500px]">
            {renderStep()}
          </div>

          {/* Footer Navigation */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => useApplicationWizardStore.getState().prevStep()}
              disabled={currentStep === 1 || isSubmitting}
              className="btn-outline px-6 py-2 disabled:opacity-50"
            >
              &larr; Back
            </button>

            <button
              onClick={() => useApplicationWizardStore.getState().nextStep()}
              disabled={isSubmitting}
              className="btn-primary px-8 py-2 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting
                ? "Processing..."
                : currentStep === totalSteps
                  ? "Submit Application"
                  : "Next Step"}{" "}
              &rarr;
            </button>
          </div>
        </div>
      </div>
    </ApplicationWizardGuard>
  );
}
