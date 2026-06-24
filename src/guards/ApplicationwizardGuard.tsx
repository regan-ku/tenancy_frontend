"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ApplicationWizardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  // ✅ FIX: Pull userState from the store to check the backend's ultimate source of truth
  const { isAuthenticated, user, isLoading, userState } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      // ✅ BULLETPROOF CHECK:
      // 1. Check userState (from /user-state/ endpoint - Ultimate Source of Truth)
      // 2. Check user object (from /profile/me/ or login)
      // 3. Fallback to false
      const isProfileComplete =
        userState?.profile_complete ??
        user?.profile_complete ??
        (user as any)?.profile?.profile_complete ??
        false;

      if (!isAuthenticated) {
        router.push("/login?redirect=/marketplace/applications/wizard");
      } else if (!isProfileComplete) {
        console.warn(
          "⚠️ Redirecting to onboarding because profile_complete is falsy.",
        );
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, user, userState, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Re-evaluate for the render return
  const isProfileComplete =
    userState?.profile_complete ??
    user?.profile_complete ??
    (user as any)?.profile?.profile_complete ??
    false;

  if (!isAuthenticated || !isProfileComplete) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
}
