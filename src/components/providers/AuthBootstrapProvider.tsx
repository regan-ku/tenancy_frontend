"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export function AuthBootstrapProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const initializeAuth = useAuthStore((state) => state.initializeAuth);

  useEffect(() => {
    // 🚨 THIS RUNS ONCE ON APP LOAD/REFRESH
    // It checks if the token exists, and if so, fetches the user profile to populate the store
    initializeAuth();
  }, [initializeAuth]);

  return <>{children}</>;
}
