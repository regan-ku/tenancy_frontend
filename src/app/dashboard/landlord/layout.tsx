"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth.store";
import LandlordLayout from "@/layouts/Landlord/LandlordLayout";

export default function LandlordRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isHydrating, isAuthenticated, user, initializeAuth } = useAuthStore();
  
  // 🚨 HYDRATION FIX: Track if the component has mounted in the browser
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    // 1. Mark as mounted so we can safely read browser-only APIs (like Cookies)
    setHasMounted(true);

    // 2. Trigger hydration if we have a token but the user object is empty.
    if (isAuthenticated && !user) {
      initializeAuth();
    }
  }, [isAuthenticated, user, initializeAuth]);

  // 🚨 THE HYDRATION GATE: 
  // If the component hasn't mounted yet (Server render + first Client render), 
  // OR if the auth store is still hydrating, show the loading spinner.
  // This guarantees the Server and Client HTML match exactly on the first pass.
  if (!hasMounted || isHydrating) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  // Once mounted and hydration is complete, render the actual Landlord Layout
  return <LandlordLayout>{children}</LandlordLayout>;
}