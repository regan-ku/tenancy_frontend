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

  const [hasMounted, setHasMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true); // ✅ Prevents blank screen flash

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isLoading || !hasMounted) return;

    const checkAccess = async () => {
      // 1. Auth Check
      if (!isAuthenticated) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
        return;
      }

      // 2. Fetch Fresh State if needed
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

      // 3. Profile Completion Check
      if (!isProfileComplete) {
        const currentPath =
          pathname +
          (searchParams?.toString() ? `?${searchParams.toString()}` : "");
        router.push(
          `/onboarding?redirect_to=${encodeURIComponent(currentPath)}`,
        );
        return;
      }

      // 4. Role Check
      const allowedRoles = ["landlord", "agency"];
      if (!userRole || !allowedRoles.includes(userRole)) {
        if (userRole === "tenant") {
          router.push("/marketplace");
        } else if (userRole) {
          router.push(`/dashboard/${userRole}`);
        } else {
          router.push("/dashboard");
        }
        return;
      }

      // ✅ CRITICAL FIX: Verification Check
      // If they are already IN the wizard, we generally let them proceed or redirect to a specific verification page.
      // We DO NOT return null here, as that causes the UI to freeze/disappear.
      if (currentState?.next_route === "/pending-verification") {
         // Optional: Allow them to finish the draft if they are already deep in the wizard?
         // For now, we redirect to verification but preserve the return URL.
         router.push(`/pending-verification?redirect_to=${encodeURIComponent(pathname)}`);
         return;
      }

      // All checks passed
      setIsChecking(false);
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

  // ✅ Show Loader while checking to prevent "Freeze/Blank Screen"
  if (!hasMounted || isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <>{children}</>;
}