"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

type ApplicationWizardUserState = {
  profile_complete?: boolean;
  role?: string |null;
  can_apply?: boolean;
  tenant_profile_complete?: boolean;
  next_route?: string;
  [key: string]: any;
};

const MANAGER_ROLES = ["landlord", "agency", "agent", "admin"];

export default function ApplicationWizardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    isAuthenticated,
    isLoading,
    userState,
    user,
    fetchUserState,
  } = useAuthStore();

  const [hasMounted, setHasMounted] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [resolvedState, setResolvedState] =
    useState<ApplicationWizardUserState | null>(null);

  const redirectStarted = useRef(false);

  const mode = searchParams.get("mode");
  const isManagerMode = mode === "manager";

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const getCurrentPath = () => {
    return (
      pathname +
      (searchParams?.toString() ? `?${searchParams.toString()}` : "")
    );
  };

  const getStoreUserState = (): ApplicationWizardUserState | null => {
    return (useAuthStore.getState() as any)?.userState ?? null;
  };

  useEffect(() => {
    if (!hasMounted || isLoading) return;

    let isActive = true;

    const safeRedirect = (destination: string) => {
      if (!isActive || redirectStarted.current) return;

      redirectStarted.current = true;
      setIsChecking(true);
      router.push(destination);
    };

    const checkAccess = async () => {
      // User must be authenticated
      if (!isAuthenticated) {
        safeRedirect(
          `/login?redirect=${encodeURIComponent(getCurrentPath())}`
        );
        return;
      }

      // Get latest user state
      let currentState =
        (userState as ApplicationWizardUserState | null) ?? null;

      const shouldFetchState =
        !currentState ||
        currentState.profile_complete === undefined ||
        currentState.can_apply === undefined;

      if (shouldFetchState && fetchUserState) {
        try {
          const fetchedState = await fetchUserState();

          currentState =
            (fetchedState as ApplicationWizardUserState | null) ??
            getStoreUserState() ??
            currentState;
        } catch (error) {
          console.error(
            "ApplicationWizardGuard failed to fetch user state",
            error
          );
        }
      }

      if (!isActive) return;

      const freshState = currentState ?? getStoreUserState();

      setResolvedState(freshState);

      // Profile completion
      const isProfileComplete =
        freshState?.profile_complete ??
        (user as any)?.profile_complete ??
        false;

      if (!isProfileComplete) {
        safeRedirect(
          `/onboarding?redirect_to=${encodeURIComponent(
            getCurrentPath()
          )}`
        );
        return;
      }

      // Manager mode
      if (isManagerMode) {
        const role = freshState?.role ?? (user as any)?.role ?? null;

        if (!role || !MANAGER_ROLES.includes(role)) {
          safeRedirect(role ? `/dashboard/${role}` : "/dashboard");
          return;
        }

        setIsChecking(false);
        return;
      }

      // Tenant mode
      const canApply = freshState?.can_apply ?? false;

      const tenantProfileComplete =
        freshState?.tenant_profile_complete ??
        (user as any)?.profile_complete ??
        false;

      const isTenantReady = canApply || tenantProfileComplete;

      if (!isTenantReady) {
        safeRedirect(
          `/onboarding?redirect_to=${encodeURIComponent(
            getCurrentPath()
          )}`
        );
        return;
      }

      setIsChecking(false);
    };

    checkAccess();

    return () => {
      isActive = false;
    };
  }, [
    hasMounted,
    isLoading,
    isAuthenticated,
    userState,
    user,
    router,
    pathname,
    searchParams,
    isManagerMode,
    fetchUserState,
  ]);

  const FullScreenLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-surface-muted">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
    </div>
  );

  if (
    !hasMounted ||
    isLoading ||
    isChecking ||
    redirectStarted.current
  ) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <FullScreenLoader />;
  }

  const isProfileComplete =
    resolvedState?.profile_complete ??
    (user as any)?.profile_complete ??
    false;

  if (!isProfileComplete) {
    return <FullScreenLoader />;
  }

  if (!isManagerMode) {
    const canApply = resolvedState?.can_apply ?? false;

    const tenantProfileComplete =
      resolvedState?.tenant_profile_complete ??
      (user as any)?.profile_complete ??
      false;

    const isTenantReady = canApply || tenantProfileComplete;

    if (!isTenantReady) {
      return <FullScreenLoader />;
    }
  }

  return <>{children}</>;
}