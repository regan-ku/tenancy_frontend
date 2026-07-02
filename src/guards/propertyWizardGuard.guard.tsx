"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function PropertyWizardGuard({
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
          console.error("PropertyWizardGuard failed to fetch user state", e);
        }
      }

      const isProfileComplete = currentState?.profile_complete ?? false;
      const userRole = currentState?.role;

      // 1. Must have a complete profile
      if (!isProfileComplete) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
        return;
      }

      // 2. Must be a Landlord or Agency to access the Property Wizard
      const allowedRoles = ["landlord", "agency"];
      if (!userRole || !allowedRoles.includes(userRole)) {
        // Redirect unauthorized roles away from the property wizard
        if (userRole === "tenant") {
          router.push("/marketplace");
        } else if (userRole) {
          router.push(`/dashboard/${userRole}`);
        } else {
          router.push("/dashboard");
        }
        return;
      }

      // 3. Check if backend dictates they need verification first
      if (currentState?.next_route === "/pending-verification") {
        router.push("/pending-verification");
        return;
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
  const userRole = userState?.role;
  const allowedRoles = ["landlord", "agency"];

  if (!isProfileComplete || !userRole || !allowedRoles.includes(userRole)) {
    return null;
  }

  if (userState?.next_route === "/pending-verification") return null;

  return <>{children}</>;
}
