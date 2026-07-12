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
  const { isAuthenticated, isLoading, userState, user, fetchUserState } =
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

      // ✅ FIX: If state is missing or doesn't have the new can_apply flag, fetch it fresh
      if (!currentState || currentState.can_apply === undefined) {
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

      // 2. ✅ CRITICAL: If in Manager Mode, bypass the tenant checks.
      if (isManagerMode) {
        return;
      }

      // 3. ✅ NEW ARCHITECTURE: Check the definitive 'can_apply' flag from the backend.
      // If the backend says they can apply, we DO NOT redirect them to onboarding.
      // This completely eliminates the stale-state loop after onboarding completion.
      const canApply = currentState?.can_apply ?? false;

      // Fallback: If can_apply is missing, check tenant_profile_complete on userState or user object
      const isTenantReady =
        canApply ||
        (currentState?.tenant_profile_complete ??
          user?.profile_complete ??
          false);

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
    user,
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

  // If not manager mode, verify they are allowed to apply
  if (!isManagerMode) {
    const canApply = userState?.can_apply ?? false;
    const isTenantReady =
      canApply || (userState?.tenant_profile_complete ?? false);
    if (!isTenantReady) return null;
  }

  return <>{children}</>;
}
