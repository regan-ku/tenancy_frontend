"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import PhoneNumberInput from "@/components/ui/PhoneNumberInput";
import AuthLayout from "@/components/layouts/AuthLayout"; // ✅ NEW IMPORT

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    role: "tenant",
    countryCode: "KE",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters.";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match.";
    if (!formData.phone || formData.phone.length < 7)
      newErrors.phone = "Please enter a valid phone number.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const dialCodeMap: Record<string, string> = {
        KE: "+254",
        UG: "+256",
        TZ: "+255",
        RW: "+250",
        GB: "+44",
        DE: "+49",
      };
      const dialCode = dialCodeMap[formData.countryCode] || "+254";
      const fullPhoneNumber = `${dialCode}${formData.phone}`;

      await apiClient.post(endpoints.AUTH.REGISTER, {
        email: formData.email,
        phone_number: fullPhoneNumber,
        password: formData.password,
        role: formData.role,
      });

      setIsSuccess(true);
      setTimeout(() => router.push("/login?registered=true"), 2000);
    } catch (err: any) {
      setErrors({
        form:
          err.response?.data?.detail ||
          err.response?.data?.email?.[0] ||
          err.response?.data?.phone_number?.[0] ||
          "Registration failed.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // ✅ WRAPPED IN NEW WIDE LAYOUT
    <AuthLayout
      title="Start managing your properties today."
      subtitle="Join thousands of landlords, agencies, and tenants on the most comprehensive real estate platform."
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        {isSuccess ? (
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
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-primary-dark">
              Registration Successful!
            </h2>
            <p className="text-slate-500">
              Your account has been created. Redirecting you to login...
            </p>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary-dark">
                Create Account
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Join the modern property management platform.
              </p>
            </div>

            {errors.form && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center border border-red-100">
                {errors.form}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-base"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  I am a...
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="input-base bg-white cursor-pointer"
                >
                  <option value="tenant">Tenant (Looking for property)</option>
                  <option value="landlord">Landlord (Owns property)</option>
                  <option value="agency">Agency (Manages properties)</option>
                </select>
              </div>

              <PhoneNumberInput
                label="Phone Number"
                value={formData.phone}
                countryCode={formData.countryCode}
                onChange={(phone, code) =>
                  setFormData((prev) => ({ ...prev, phone, countryCode: code }))
                }
                required
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="input-base pr-10"
                    placeholder="Min 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary"
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="input-base pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-primary"
                  >
                    {showConfirmPassword ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary py-3 text-base disabled:opacity-70 transition-all flex justify-center items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="text-center text-sm">
        <p className="text-slate-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-secondary font-bold hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
