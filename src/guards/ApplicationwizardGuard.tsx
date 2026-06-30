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

  const { isAuthenticated, user, isLoading, userState } = useAuthStore();

  // ✅ FIX 1: Prevent Hydration Mismatch caused by Zustand localStorage hydration
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const mode = searchParams.get("mode");
  const isManagerMode = mode === "manager";

  useEffect(() => {
    // ✅ Only run redirect logic AFTER the component has mounted on the client
    if (!isLoading && hasMounted) {
      if (!isAuthenticated) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // ✅ Manager Mode Bypass
      if (isManagerMode) {
        return;
      }

      const isProfileComplete =
        userState?.profile_complete ??
        user?.profile_complete ??
        (user as any)?.profile?.profile_complete ??
        false;

      const isTenantReady = userState?.tenant_profile_complete ?? true;

      if (!isProfileComplete) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
      } else if (!isTenantReady) {
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
    hasMounted,
  ]);

  // ✅ FIX 2: Render a loading state until the client has mounted and Zustand has hydrated
  if (!hasMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Re-evaluate for the render return
  if (!isAuthenticated) {
    return null;
  }

  if (isManagerMode) {
    return <>{children}</>;
  }

  const isProfileComplete =
    userState?.profile_complete ??
    user?.profile_complete ??
    (user as any)?.profile?.profile_complete ??
    false;

  const isTenantReady = userState?.tenant_profile_complete ?? true;

  if (!isProfileComplete || !isTenantReady) {
    return null;
  }

  return <>{children}</>;
}
