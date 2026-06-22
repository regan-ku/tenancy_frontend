"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth.store";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import AuthLayout from "@/components/layouts/AuthLayout"; // ✅ NEW IMPORT

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showRegistrationSuccess, setShowRegistrationSuccess] = useState(false);

  const { login, isLoading, error, clearError } = useAuthStore();
  const { handlePostLoginRedirect, isRedirecting, redirectError } =
    useAuthRedirect();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") === "true") {
      setShowRegistrationSuccess(true);
      window.history.replaceState({}, "", "/login");
      const timer = setTimeout(() => setShowRegistrationSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setShowRegistrationSuccess(false);

    await login({ email, password });

    if (!useAuthStore.getState().error) {
      await handlePostLoginRedirect();
    }
  };

  return (
    // ✅ WRAPPED IN NEW WIDE LAYOUT
    <AuthLayout
      title="Welcome back to your property ecosystem."
      subtitle="Sign in to manage your rentals, track payments, and connect with your tenants seamlessly."
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary-dark">Sign In</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        {showRegistrationSuccess && (
          <div className="bg-green-50 text-green-700 p-3 rounded-lg text-sm text-center border border-green-100 flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-2">
            <svg
              className="w-4 h-4 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            <span>Account created successfully! Please sign in.</span>
          </div>
        )}

        {(error || redirectError) && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100 flex items-center justify-center gap-2">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              ></path>
            </svg>
            {error || redirectError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-base"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-xs text-secondary font-bold hover:underline"
              >
                Forgot?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-base"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || isRedirecting}
            className="w-full btn-primary py-3 text-base disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            {isLoading || isRedirecting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLoading ? "Signing in..." : "Loading Dashboard..."}
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </div>

      <div className="text-center text-sm">
        <p className="text-slate-600">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-secondary font-bold hover:underline transition-colors"
          >
            Create one here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
