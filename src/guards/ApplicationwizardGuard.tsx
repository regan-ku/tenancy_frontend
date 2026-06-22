"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function ApplicationWizardGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      // 1. Must be logged in to apply
      if (!isAuthenticated) {
        router.push("/login?redirect=/applications/wizard");
      }
      // 2. Must have a complete profile (Onboarding must be done)
      else if (!user?.profile_complete) {
        router.push("/onboarding");
      }
    }
  }, [isAuthenticated, user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-muted">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated or profile is incomplete, render nothing (redirecting)
  if (!isAuthenticated || !user?.profile_complete) {
    return null;
  }

  return <>{children}</>;
}
