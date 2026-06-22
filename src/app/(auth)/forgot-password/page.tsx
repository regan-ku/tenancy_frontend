"use client";

import React, { useState } from "react";
import Link from "next/link";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import AuthLayout from "@/components/layouts/AuthLayout";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      // Fallback endpoint provided in case it's not in your endpoints.ts yet
      await apiClient.post(
        endpoints.AUTH?.FORGOT_PASSWORD || "/api/accounts/password-reset/",
        { email },
      );
      setIsSuccess(true);
    } catch (err: any) {
      setError(
        err.response?.data?.detail ||
          "Failed to send reset link. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset your password securely."
      subtitle="Enter your email address and we'll send you a link to reset your password and regain access to your account."
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 space-y-6">
        {!isSuccess ? (
          <>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary-dark">
                Forgot Password?
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {error}
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base disabled:opacity-70 flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Sending Link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4 py-6 animate-in fade-in zoom-in-95">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-dark">
              Check Your Email
            </h2>
            <p className="text-slate-500 text-sm">
              We've sent a password reset link to{" "}
              <span className="font-bold text-slate-700">{email}</span>. Please
              check your inbox and spam folder.
            </p>
          </div>
        )}
      </div>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="text-secondary font-bold hover:underline transition-colors"
        >
          ← Back to Sign In
        </Link>
      </div>
    </AuthLayout>
  );
}
