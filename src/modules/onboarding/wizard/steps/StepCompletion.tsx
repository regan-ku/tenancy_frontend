"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // ✅ 1. Import Next.js App Router
import { useOnboardingWizardStore } from "@/store/onboardingWizard.store";
import { useAuthStore } from "@/store/auth.store";
import { profileApi } from "@/api/profile.api";

export default function StepCompletion() {
  const router = useRouter(); // ✅ 2. Initialize the router
  
  const { userRole, formData, setSubmitting, isSubmitting, error } =
    useOnboardingWizardStore();

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          payload.append(key, value);
        } else if (key === "directors" && Array.isArray(value)) {
          payload.append(key, JSON.stringify(value));
        } else if (value !== null && value !== undefined) {
          payload.append(key, String(value));
        }
      });

      // 1. Submit onboarding data to backend
      await profileApi.completeOnboarding(payload);

      // 2. Fetch the true next route from the backend's State Engine
      const stateData = await useAuthStore.getState().fetchUserState();

      // 3. Immediately update the auth store so guards know the profile is complete
      if (stateData) {
        useAuthStore.setState({ userState: stateData });

        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            // ✅ The backend reliably returns true here now
            profile_complete: stateData.profile_complete, 
          });
        }
      }

      // 4. Show success UI WITHOUT resetting the wizard state yet.
      setIsSuccess(true);

      // 5. Clear the persisted localStorage draft directly.
      if (typeof window !== "undefined") {
        localStorage.removeItem("tennacy-onboarding-draft");
      }

      // 6. Navigate to the correct destination
      setTimeout(() => {
        // ✅ Trust the backend's State Resolution Engine for the exact route
        let nextRoute = stateData?.next_route || "/marketplace";

        // Fallback overrides just in case the backend route is generic
        if (userRole === "landlord" && !stateData?.next_route?.includes("dashboard")) {
          nextRoute = stateData?.next_route || "/properties/wizard";
        } else if (userRole === "agency") {
          nextRoute = stateData?.next_route || "/pending-verification";
        }

        // ✅ CRITICAL FIX: Use router.push for smooth, state-preserving navigation.
        // This prevents the hard reload that was wiping the auth store and 
        // triggering the onboarding guard trap.
        router.push(nextRoute); 
      }, 2000); // 2 seconds to read the success message
      
    } catch (err: any) {
      console.error("Onboarding submission failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center py-12 space-y-6 animate-in fade-in zoom-in-95">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
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
        <div>
          <h2 className="text-2xl font-bold text-primary-dark mb-2">
            Profile Submitted Successfully!
          </h2>
          <p className="text-slate-500 max-w-md mx-auto">
            {userRole === "tenant"
              ? "You're all set! Redirecting you to the marketplace to browse properties..."
              : "Your documents have been submitted for review. Your Tennacy account is now 'Pending Verification'. Redirecting you to your dashboard..."}
          </p>
        </div>
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Review & Submit
        </h2>
        <p className="text-slate-500">
          Please review your information. Once submitted,{" "}
          {userRole === "tenant"
            ? "you can start using the platform immediately."
            : "your account will be flagged for admin verification."}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-primary-dark">
          Submission Checklist
        </h3>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Personal/Business
            Information completed
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">✓</span>{" "}
            {userRole === "agency"
              ? "At least one Director added"
              : "Next of Kin information added"}
          </li>
          {userRole !== "tenant" && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span> Required verification
              documents attached
            </li>
          )}
        </ul>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full btn-primary py-4 text-lg font-bold shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Submitting Profile...
          </>
        ) : (
          "🚀 Complete Onboarding & Submit"
        )}
      </button>
    </div>
  );
}