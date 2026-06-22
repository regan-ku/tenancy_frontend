"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function OnboardingGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading, fetchUserState, setUser } =
    useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      if (isLoading) return;

      if (!isAuthenticated) {
        router.push("/login?redirect=/onboarding");
        return;
      }

      let currentUser = user;

      // ✅ FIX: Fetch state if missing to prevent the "undefined" trap
      if (!currentUser?.role || currentUser?.profile_complete === undefined) {
        try {
          const state = await fetchUserState();
          if (state) {
            currentUser = {
              ...currentUser,
              role: state.role,
              profile_complete: state.profile_complete,
            } as any;
            setUser(currentUser);
          }
        } catch (e) {
          console.error("Guard failed to fetch user state", e);
        }
      }

      // ✅ If profile is ALREADY complete, they shouldn't be here!
      // Ask the backend where they SHOULD be, and send them there.
      if (currentUser?.profile_complete) {
        try {
          const state = await fetchUserState();
          if (state?.next_route) {
            router.push(state.next_route); // e.g., /properties/wizard
          } else {
            router.push("/dashboard");
          }
        } catch {
          router.push("/dashboard");
        }
        return;
      }

      // Profile is incomplete, let them see the onboarding wizard.
      setIsChecking(false);
    };

    checkAccess();
  }, [isAuthenticated, user, isLoading, router, fetchUserState, setUser]);

  if (isLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
