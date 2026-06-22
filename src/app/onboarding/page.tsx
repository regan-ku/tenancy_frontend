"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";
import { useAuthStore } from "@/store/auth.store";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import { profileApi } from "@/api/profile.api";

import StepPersonalOrBusinessInfo from "@/modules/onboarding/wizard/steps/StepPersonalorBusinessInfo";
import StepContactsOrDirectors from "@/modules/onboarding/wizard/steps/StepContactorDirectors";
import StepVerification from "@/modules/onboarding/wizard/steps/StepVerification";
import StepCompletion from "@/modules/onboarding/wizard/steps/StepCompletion";

// ✅ STRICT VALIDATION HELPERS
const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidPhone = (phone: string) => /^(\+254|254|0)[17]\d{8}$/.test(phone);
const isValidName = (name: string) => /^[a-zA-Z\s\-']{2,60}$/.test(name);
const isValidID = (id: string) => /^[A-Za-z0-9]{6,20}$/.test(id);
const isValidRegNumber = (reg: string) => /^[A-Za-z0-9\-]{5,30}$/.test(reg);

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isAuthenticated, fetchUserState } = useAuthStore();
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
    resetWizard,
    setUserId,
    userId,
  } = useOnboardingWizardStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectMessage, setRedirectMessage] = useState<string>(
    "Redirecting you to your dashboard...",
  );

  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ✅ SYNC USER ID: Locks the draft to the currently logged-in user
  useEffect(() => {
    if (user?.id && String(user.id) !== userId) {
      setUserId(String(user.id));
    }
  }, [user, userId, setUserId]);

  // ✅🚨 CRITICAL FIX: AUTO-POPULATE & ROLE RESOLUTION
  // We MUST always fetch the profile to ensure the userRole is set correctly,
  // even if the user already has a phone number.
  useEffect(() => {
    if (!hasMounted || !isAuthenticated || isSuccess) return;

    // 1. Immediately set role from auth store if available
    const authRole = (user as any)?.role;
    if (authRole && !userRole) {
      setUserRole(authRole);
    }

    // 2. Update phone number from auth store if it's still the default
    const authPhone = (user as any)?.phone_number || (user as any)?.phone;
    if (
      authPhone &&
      (formData.phone_number === "+254" || !formData.phone_number)
    ) {
      updateFormData({ phone_number: authPhone });
    }

    // 3. ALWAYS fetch profile from backend to guarantee we have the correct role and phone
    apiClient
      .get(endpoints.PROFILE.ME)
      .then((res) => {
        const profile = res.data;
        const backendPhone = profile?.phone_number || profile?.phone;
        const backendRole = profile?.role;

        if (
          backendPhone &&
          (formData.phone_number === "+254" || !formData.phone_number)
        ) {
          updateFormData({ phone_number: backendPhone });
        }

        // ✅ CRITICAL: Always set the role from the backend if the store doesn't have it
        if (backendRole && !userRole) {
          setUserRole(backendRole as any);
        }
      })
      .catch((err) => console.warn("Profile fetch failed:", err));
  }, [hasMounted, isAuthenticated, user, userRole, isSuccess]);

  const totalSteps = userRole === "tenant" ? 3 : 4;
  const progress = (currentStep / totalSteps) * 100;

  // ✅ STRICT VALIDATION GATEKEEPER
  const validateCurrentStep = (): boolean => {
    setError(null);

    if (currentStep === 1) {
      if (userRole === "agency") {
        if (!isValidName(formData.business_name)) {
          setError("⚠️ Invalid business name. Use letters and spaces only.");
          return false;
        }
        if (!isValidRegNumber(formData.registration_number)) {
          setError(
            "⚠️ Invalid registration number. Use 5-30 alphanumeric characters.",
          );
          return false;
        }
        if (!isValidEmail(formData.business_email)) {
          setError("⚠️ Please provide a valid business email address.");
          return false;
        }
      } else {
        if (!isValidName(formData.full_name)) {
          setError("⚠️ Invalid full name. Use letters and spaces only.");
          return false;
        }
        const isTenant = userRole === "tenant";
        if (!isTenant && !isValidID(formData.id_number)) {
          setError(
            "⚠️ Invalid ID/Passport. Must be 6-20 alphanumeric characters.",
          );
          return false;
        }
        if (!formData.date_of_birth) {
          setError("⚠️ Please provide your date of birth.");
          return false;
        }
        if (!isValidName(formData.nationality)) {
          setError("⚠️ Invalid nationality. Use letters only.");
          return false;
        }
      }

      if (!isValidPhone(formData.phone_number)) {
        setError(
          "⚠️ Invalid phone number. Use format: +254712345678 or 0712345678.",
        );
        return false;
      }
      if (!formData.address || formData.address.length < 5) {
        setError(
          "⚠️ Please provide a valid physical address (min 5 characters).",
        );
        return false;
      }
    }

    if (currentStep === 2) {
      if (userRole === "agency") {
        if (formData.directors.length === 0) {
          setError("⚠️ An agency must have at least one director added.");
          return false;
        }
        for (const d of formData.directors) {
          if (!isValidName(d.full_name)) {
            setError(`⚠️ Invalid name for director: ${d.full_name}`);
            return false;
          }
          if (!isValidID(d.id_number)) {
            setError(`⚠️ Invalid ID for director: ${d.full_name}`);
            return false;
          }
          if (!isValidEmail(d.email)) {
            setError(`⚠️ Invalid email for director: ${d.full_name}`);
            return false;
          }
          if (!isValidPhone(d.phone_number)) {
            setError(`⚠️ Invalid phone for director: ${d.full_name}`);
            return false;
          }
          const ownership = parseInt(d.ownership_percentage);
          if (isNaN(ownership) || ownership < 1 || ownership > 100) {
            setError(
              `⚠️ Ownership % for ${d.full_name} must be between 1 and 100.`,
            );
            return false;
          }
        }
      } else {
        if (!isValidName(formData.next_of_kin_name)) {
          setError("⚠️ Invalid Next of Kin name. Use letters and spaces only.");
          return false;
        }
        if (!formData.next_of_kin_relationship) {
          setError("⚠️ Please select a relationship.");
          return false;
        }
        if (!isValidPhone(formData.next_of_kin_phone)) {
          setError(
            "⚠️ Invalid Next of Kin phone. Use format: +254712345678 or 0712345678.",
          );
          return false;
        }
      }
    }

    // ✅ STRICT VALIDATION FOR VERIFICATION DOCUMENTS (STEP 3)
    if (currentStep === 3 && userRole !== "tenant") {
      if (!formData.kra_pin || formData.kra_pin.length !== 11) {
        setError("⚠️ Please enter a valid 11-character KRA PIN.");
        return false;
      }
      if (userRole === "landlord") {
        if (!formData.id_document_front || !formData.id_document_back) {
          setError("⚠️ Please upload both front and back of your National ID.");
          return false;
        }
        if (!formData.kra_tax_compliance_cert) {
          setError("⚠️ Please upload your KRA Tax Compliance Certificate.");
          return false;
        }
      }
      if (userRole === "agency") {
        if (!formData.business_registration) {
          setError("⚠️ Please upload your Business Registration Certificate.");
          return false;
        }
        if (!formData.kra_tax_compliance_cert) {
          setError("⚠️ Please upload your KRA Tax Compliance Certificate.");
          return false;
        }
        if (!formData.agency_license) {
          setError("⚠️ Please upload your EARB Agency License.");
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
        if (value instanceof File) payload.append(key, value);
        else if (key === "directors" && Array.isArray(value))
          payload.append(key, JSON.stringify(value));
        else if (value !== null && value !== undefined && value !== "")
          payload.append(key, String(value));
      });

      await profileApi.completeOnboarding(payload);

      setIsSuccess(true);

      setTimeout(async () => {
        const userState = await fetchUserState();
        if (userState?.next_route) {
          setRedirectMessage(
            userState.message || "Redirecting you to your dashboard...",
          );

          setTimeout(() => {
            resetWizard();
            router.push(userState.next_route);
          }, 3000);
        } else {
          resetWizard();
          router.push("/dashboard");
        }
      }, 500);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Submission failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = () => {
    if (userRole === "tenant") {
      switch (currentStep) {
        case 1:
          return <StepPersonalOrBusinessInfo />;
        case 2:
          return <StepContactsOrDirectors />;
        case 3:
          return <StepCompletion />;
        default:
          return <StepPersonalOrBusinessInfo />;
      }
    } else {
      switch (currentStep) {
        case 1:
          return <StepPersonalOrBusinessInfo />;
        case 2:
          return <StepContactsOrDirectors />;
        case 3:
          return <StepVerification />;
        case 4:
          return <StepCompletion />;
        default:
          return <StepPersonalOrBusinessInfo />;
      }
    }
  };

  if (!hasMounted)
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );

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
          <p className="text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {redirectMessage}
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
              Complete your profile to get started
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
            <div className="bg-red-50 text-red-700 p-5 rounded-xl mb-6 text-base font-semibold border-2 border-red-200 flex items-center gap-3 shadow-sm">
              <svg
                className="w-6 h-6 flex-shrink-0 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
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
            className="btn-outline px-6 py-2.5 disabled:opacity-50"
          >
            ← Back
          </button>
          <button
            onClick={handleNextOrSubmit}
            disabled={isSubmitting}
            className="btn-primary px-8 py-2.5 disabled:opacity-70 flex items-center gap-2"
          >
            {isSubmitting
              ? "Processing..."
              : currentStep === totalSteps
                ? "🚀 Submit & Complete"
                : "Next Step →"}
          </button>
        </div>
      </div>
    </div>
  );
}
