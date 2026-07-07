"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import MarketplaceNavbar from "@/components/navigation/MarketplaceNavbar";

export default function PendingVerificationPage() {
  const router = useRouter();
  const { fetchUserState, logout } = useAuthStore();

  const [message, setMessage] = useState(
    "Your documents are currently under review by our admin team. This page will automatically redirect you once your account is approved.",
  );
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkStatus = async () => {
      if (!isMounted) return;

      setIsChecking(true);
      try {
        const state = await fetchUserState();

        if (!isMounted) return;

        if (state?.message) {
          setMessage(state.message);
        }

        // ✅ AUTO-REDIRECT: If admin approved them
        if (state?.next_route && state.next_route !== "/pending-verification") {
          setMessage(
            state.message || "Account verified! Redirecting you now...",
          );

          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }

          // ✅🚨 CRITICAL FIX: Use window.location.href instead of router.push()
          // This forces a full page reload, which:
          // 1. Clears the stale auth store state
          // 2. Triggers the bootstrap process
          // 3. Re-fetches the user state from the backend
          // 4. Ensures the middleware sees the correct "verified" status
          setTimeout(() => {
            window.location.href = state.next_route;
          }, 1500); // Small delay to show the success message
          return;
        }

        setLastChecked(new Date().toLocaleTimeString());
      } catch (error) {
        console.error("Failed to check status", error);
      } finally {
        if (isMounted) {
          setIsChecking(false);
        }
      }
    };

    checkStatus();

    intervalRef.current = setInterval(checkStatus, 5000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [router, fetchUserState]);

  return (
    <div className="min-h-screen flex flex-col bg-surface-muted">
      <MarketplaceNavbar />
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6 relative">
            <svg
              className="w-10 h-10 text-amber-600 animate-pulse"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="absolute inset-0 rounded-full border-2 border-amber-400 animate-ping opacity-20"></div>
          </div>

          <h1 className="text-2xl font-bold text-primary-dark mb-3">
            Pending Verification
          </h1>

          <p className="text-slate-600 mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
            {message}
          </p>

          <div className="mb-8 h-6 flex items-center justify-center gap-2 text-sm text-slate-500">
            {isChecking ? (
              <>
                <span className="w-3 h-3 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                <span>Checking for updates...</span>
              </>
            ) : lastChecked ? (
              <span>Last checked at {lastChecked}</span>
            ) : null}
          </div>

          <button
            onClick={() => logout()}
            className="w-full text-slate-500 hover:text-red-500 font-medium transition-colors py-2 border border-slate-200 rounded-lg hover:bg-red-50 hover:border-red-200"
          >
            Log Out
          </button>
        </div>
      </main>
    </div>
  );
}
