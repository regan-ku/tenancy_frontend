"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function PropertyWizardGuard({
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
      // ✅🚨 CRITICAL FIX: If authenticated but user object is missing (e.g. after refresh/cleared storage),
      // we MUST fetch the user state and wait. Do NOT redirect to /dashboard yet!
      if (isAuthenticated && !user) {
        try {
          const state = await fetchUserState();
          if (state) {
            // Create a minimal user object to satisfy the guard checks
            setUser({
              id: state.user_id || 0,
              email: state.email || "",
              role: state.role,
              profile_complete: state.profile_complete,
            } as any);
          }
        } catch (e) {
          console.error("Guard failed to fetch user state", e);
        }
        return; // Stop execution here, wait for `user` to update in the store
      }

      if (isLoading || !user) return; // Wait for user to be fully loaded

      if (!isAuthenticated) {
        router.push("/login?redirect=/properties/wizard");
        return;
      }

      let currentUser = user;

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

      // 2. Check Role
      if (currentUser?.role !== "landlord" && currentUser?.role !== "agency") {
        router.push("/dashboard");
        return;
      }

      // 3. Check Profile Completion
      if (!currentUser?.profile_complete) {
        router.push("/onboarding");
        return;
      }

      // All checks passed! Render the wizard.
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
