"use client";

import React, { useEffect, useState } from "react";
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
  const { isAuthenticated, isLoading, userState, fetchUserState } =
    useAuthStore();

  // ✅ FIX: Prevent Hydration Mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // ✅ Detect if the manager is creating an application on behalf of someone else
  const mode = searchParams.get("mode");
  const isManagerMode = mode === "manager";

  useEffect(() => {
    if (isLoading || !hasMounted) return;

    const checkAccess = async () => {
      if (!isAuthenticated) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      let currentState = userState;
      if (!currentState || currentState.profile_complete === undefined) {
        try {
          currentState = await fetchUserState();
        } catch (e) {
          console.error("ApplicationWizardGuard failed to fetch user state", e);
        }
      }

      const isProfileComplete = currentState?.profile_complete ?? false;

      // 1. Everyone must have a complete base profile
      if (!isProfileComplete) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
        return;
      }

      // 2. ✅ CRITICAL: If in Manager Mode, bypass the tenant_profile_complete check.
      // The manager is applying on behalf of a tenant, so the manager's personal DOB/NOK is irrelevant.
      if (isManagerMode) {
        return;
      }

      // 3. For normal users (Tenants/Staff applying for themselves),
      // they MUST have completed their tenant profile (DOB + Next of Kin).
      const isTenantReady = currentState?.tenant_profile_complete ?? false;

      if (!isTenantReady) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    userState,
    isLoading,
    hasMounted,
    router,
    pathname,
    searchParams,
    isManagerMode,
    fetchUserState,
  ]);

  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isProfileComplete = userState?.profile_complete ?? false;
  if (!isProfileComplete) return null;

  // If not manager mode, we must also ensure tenant_profile_complete is true before rendering
  if (!isManagerMode) {
    const isTenantReady = userState?.tenant_profile_complete ?? false;
    if (!isTenantReady) return null;
  }

  return <>{children}</>;
}
