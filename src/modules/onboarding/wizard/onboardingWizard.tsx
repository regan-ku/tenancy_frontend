"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";
import { useAuthStore } from "@/store/auth.store";
import { profileApi } from "@/api/profile.api";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";

import StepPersonalOrBusinessInfo from "./steps/StepPersonalorBusinessInfo";
import StepContactsOrDirectors from "./steps/StepContactorDirectors";
import StepVerification from "./steps/StepVerification";
import StepCompletion from "./steps/StepCompletion";

export default function OnboardingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");

  const { user } = useAuthStore();
  const {
    currentStep,
    userRole,
    formData,
    error,
    nextStep,
    prevStep,
    setUserRole,
    updateFormData,
    setError,
    isSubmitting,
    setSubmitting,
    getTotalSteps,
    resetWizard,
  } = useOnboardingWizardStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Auto-populate role, phone, and Ghost Profile data
  useEffect(() => {
    if (user && hasMounted) {
      if (user.role && !userRole) setUserRole(user.role as any);

      // 1. Fast auto-populate from Auth Store
      const userPhone = (user as any).phone_number || (user as any).phone;

      const initialUpdates: any = {};
      if (
        userPhone &&
        (!formData.phone_number || formData.phone_number === "+254")
      ) {
        initialUpdates.phone_number = userPhone;
      }

      // ✅ FIX: Removed the email logic entirely. Email is on the User model, not the Profile model.

      if (Object.keys(initialUpdates).length > 0) {
        updateFormData(initialUpdates);
      }

      // 2. Fetch full profile from API to catch Ghost Profile data (e.g., full_name assigned by manager)
      const fetchProfile = async () => {
        try {
          const response = await apiClient.get(endpoints.PROFILE.ME);
          const profileData = response.data;

          const apiUpdates: any = {};
          if (profileData.full_name && !formData.full_name)
            apiUpdates.full_name = profileData.full_name;
          if (profileData.nationality && !formData.nationality)
            apiUpdates.nationality = profileData.nationality;
          if (profileData.address && !formData.address)
            apiUpdates.address = profileData.address;
          if (profileData.date_of_birth && !formData.date_of_birth)
            apiUpdates.date_of_birth = profileData.date_of_birth;

          if (Object.keys(apiUpdates).length > 0) {
            updateFormData(apiUpdates);
          }
        } catch (err) {
          console.warn("Could not auto-populate profile data:", err);
        }
      };

      fetchProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, hasMounted]);

  if (!hasMounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const totalSteps = getTotalSteps();
  const progress = (currentStep / totalSteps) * 100;

  const validateCurrentStep = (): boolean => {
    setError(null);
    if (currentStep === 1) {
      if (userRole === "agency") {
        if (
          !formData.business_name ||
          !formData.registration_number ||
          !formData.business_email
        ) {
          setError("Please fill in all required business details.");
          return false;
        }
      } else {
        if (
          !formData.full_name ||
          !formData.id_number ||
          !formData.date_of_birth ||
          !formData.nationality
        ) {
          // ✅ FIX: If user is staff, id_number might be optional, but let's stick to your existing validation logic.
          // If you want id_number to be optional for tenants, you should remove it from this check.
          if (
            !formData.full_name ||
            !formData.date_of_birth ||
            !formData.nationality
          ) {
            setError("Please fill in all required personal details.");
            return false;
          }
        }
      }
      if (!formData.phone_number || formData.phone_number.length < 10) {
        setError("Please provide a valid phone number.");
        return false;
      }
      if (!formData.address) {
        setError("Please provide your physical address.");
        return false;
      }
    }

    if (currentStep === 2) {
      if (userRole === "agency") {
        if (formData.directors.length === 0) {
          setError("An agency must have at least one director added.");
          return false;
        }
      } else {
        if (
          !formData.next_of_kin_name ||
          !formData.next_of_kin_phone ||
          !formData.next_of_kin_relationship
        ) {
          setError("Please provide complete Next of Kin details.");
          return false;
        }
      }
    }
    return true;
  };

  const handleNextOrSubmit = async () => {
    if (currentStep < totalSteps) {
      if (validateCurrentStep()) nextStep();
    } else {
      if (validateCurrentStep()) await handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          payload.append(key, value);
        } else if (key === "directors" && Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined && value !== "") {
          payload.append(key, String(value));
        }
      });

      await profileApi.completeOnboarding(payload);
      resetWizard();
      setIsSuccess(true);

      setTimeout(() => {
        if (redirectTo) {
          router.push(redirectTo);
        } else if (userRole === "tenant") router.push("/dashboard/tenant");
        else if (userRole === "landlord") router.push("/dashboard/landlord");
        else if (userRole === "agency") router.push("/dashboard/agency");
        else router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      setError(
        err.response?.data?.detail || "Submission failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepPersonalOrBusinessInfo />;
      case 2:
        return <StepContactsOrDirectors />;
      case 3:
        return userRole === "tenant" ? (
          <StepCompletion />
        ) : (
          <StepVerification />
        );
      case 4:
        return <StepCompletion />;
      default:
        return <StepPersonalOrBusinessInfo />;
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl border border-slate-100 text-center animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary-dark mb-2">
            Profile Submitted!
          </h2>
          <p className="text-slate-500 mb-6">
            {redirectTo
              ? "Profile completed! Redirecting you to finish your application..."
              : userRole === "tenant"
                ? "You're all set! Redirecting you to your Tennacy dashboard..."
                : "Your documents have been submitted. Redirecting you to your dashboard..."}
          </p>
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-muted py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-primary/20">
            T
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary-dark tracking-tight">
              Tennacy
            </h1>
            <p className="text-sm text-slate-500">
              {redirectTo
                ? "Complete your tenant profile to proceed with your application"
                : "Complete your profile to get started"}
            </p>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-slate-600 mb-2">
            <span>
              Step {currentStep} of {totalSteps}
            </span>
            <span className="capitalize">{userRole || "User"} Onboarding</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-secondary h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8 min-h-[400px]">
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 text-sm border border-red-200 flex items-center gap-2">
              <svg
                className="w-5 h-5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              {error}
            </div>
          )}
          {renderStep()}
        </div>

        <div className="flex justify-between mt-6">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className="btn-outline px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            &larr; Back
          </button>
          <button
            onClick={handleNextOrSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-2.5 disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2 font-semibold shadow-lg shadow-primary/20"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Processing...
              </>
            ) : currentStep === totalSteps ? (
              "🚀 Submit & Complete"
            ) : (
              "Next Step &rarr;"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
