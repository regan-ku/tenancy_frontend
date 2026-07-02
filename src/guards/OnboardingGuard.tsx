"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect_to");

  const {
    isAuthenticated,
    user,
    isLoading,
    userState,
    fetchUserState,
    setUser,
  } = useAuthStore();

  // ✅ FIX: Prevent Hydration Mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    if (isLoading || !hasMounted) return;

    const checkAccess = async () => {
      if (!isAuthenticated) {
        router.push("/login?redirect=/onboarding");
        return;
      }

      let currentState = userState;
      let currentUser = user;

      // ✅ Fetch state if missing to prevent the "undefined" trap on refresh
      if (!currentState || currentState.profile_complete === undefined) {
        try {
          const state = await fetchUserState();
          currentState = state;
          if (state) {
            currentUser = {
              ...currentUser,
              role: state.role,
              profile_complete: state.profile_complete,
            } as any;
            setUser(currentUser);
          }
        } catch (e) {
          console.error("OnboardingGuard failed to fetch user state", e);
        }
      }

      const isProfileComplete = currentState?.profile_complete ?? false;

      // ✅ CRITICAL HANDSHAKE: If they were redirected here from an Application Wizard
      // (to finish DOB/NOK) OR their profile is genuinely incomplete, let them see the wizard.
      if (redirectTo || !isProfileComplete) {
        setIsChecking(false);
        return;
      }

      // If profile is ALREADY complete and there's no redirect_to,
      // they shouldn't be here! Send them to their correct dashboard.
      if (isProfileComplete) {
        const nextRoute = currentState?.next_route || "/dashboard";
        router.push(nextRoute); // e.g., /dashboard/agency, /properties/wizard
        return;
      }
    };

    checkAccess();
  }, [
    isAuthenticated,
    user,
    userState,
    isLoading,
    hasMounted,
    router,
    fetchUserState,
    setUser,
    redirectTo,
  ]);

  if (!hasMounted || isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
