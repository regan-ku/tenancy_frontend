"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ApplicationWizardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { isAuthenticated, user, isLoading, userState } = useAuthStore();

  // ✅ CRITICAL FIX: Detect if the manager is creating an application on behalf of someone else
  const mode = searchParams.get("mode");
  const isManagerMode = mode === "manager";

  useEffect(() => {
    if (!isLoading) {
      const isProfileComplete =
        userState?.profile_complete ??
        user?.profile_complete ??
        (user as any)?.profile?.profile_complete ??
        false;

      // ✅ CRITICAL FIX: Only check tenant_profile_complete if the logged-in user
      // is applying for THEMSELVES. If in Manager Mode, the applicant is the tenant_id in the URL.
      const isTenantReady = isManagerMode
        ? true
        : (userState?.tenant_profile_complete ?? true);

      if (!isAuthenticated) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else if (!isProfileComplete) {
        console.warn(
          "⚠️ Redirecting to onboarding because profile_complete is falsy.",
        );
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
      } else if (!isTenantReady) {
        console.warn(
          "⚠️ Redirecting to onboarding because tenant_profile_complete is falsy.",
        );
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
      }
    }
  }, [
    isAuthenticated,
    user,
    userState,
    isLoading,
    router,
    pathname,
    searchParams,
    isManagerMode,
  ]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isProfileComplete =
    userState?.profile_complete ??
    user?.profile_complete ??
    (user as any)?.profile?.profile_complete ??
    false;

  // ✅ Re-evaluate for the render return with the Manager Mode bypass
  const isTenantReady = isManagerMode
    ? true
    : (userState?.tenant_profile_complete ?? true);

  if (!isAuthenticated || !isProfileComplete || !isTenantReady) {
    return null; // Render nothing while redirecting
  }

  return <>{children}</>;
}
