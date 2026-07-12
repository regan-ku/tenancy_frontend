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

            // ✅ CRITICAL: Update the global store so other components/guards see the fresh state
            useAuthStore.setState({ userState: state });
          }
        } catch (e) {
          console.error("OnboardingGuard failed to fetch user state", e);
        }
      }

      const isProfileComplete = currentState?.profile_complete ?? false;

      // ✅ CRITICAL FIX: THE "BOUNCE" MECHANISM
      // If the profile is ALREADY complete, they should NEVER be stuck in the onboarding wizard,
      // even if they were redirected here by another guard. Bounce them to their destination.
      if (isProfileComplete) {
        // For tenants, also verify they completed the legal requirements (DOB + NOK)
        const isTenantReady =
          currentState?.tenant_profile_complete ??
          currentState?.can_apply ??
          false;

        // If they are a tenant and still missing legal requirements, let them see the wizard.
        if (user?.role === "tenant" && !isTenantReady) {
          setIsChecking(false);
          return;
        }

        // They are fully complete! Send them to where they wanted to go.
        const destination =
          redirectTo || currentState?.next_route || "/marketplace";
        router.push(destination);
        return;
      }

      // If profile is NOT complete, let them see the onboarding wizard.
      setIsChecking(false);
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
