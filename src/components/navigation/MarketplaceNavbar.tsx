"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // ✅ ADDED IMPORT FOR NEXT.JS IMAGE OPTIMIZATION
import { useAuthStore } from "@/store/auth.store";

export default function MarketplaceNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();

  // ✅ FIX: Track if the component has mounted on the client to prevent hydration mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  // Determine what to show in the Auth section
  const renderAuthButtons = () => {
    // ✅ Render default unauthenticated state on server/first render to match HTML
    if (!hasMounted) {
      return (
        <>
          <Link
            href="/login"
            className="text-slate-600 font-medium hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            Create Account
          </Link>
        </>
      );
    }

    if (!isAuthenticated) {
      return (
        <>
          <Link
            href="/login"
            className="text-slate-600 font-medium hover:text-primary transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
          >
            Create Account
          </Link>
        </>
      );
    }

    // If logged in as Landlord or Agency, show Add Property
    if (user?.role === "landlord" || user?.role === "agency") {
      return (
        <>
          <Link
            href="/properties/wizard"
            className="flex items-center gap-1 text-primary font-semibold hover:text-primary-light transition-colors border border-primary/20 px-4 py-2 rounded-lg hover:bg-primary/5"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Property
          </Link>
          <button
            onClick={logout}
            className="text-slate-500 hover:text-red-500 font-medium transition-colors"
          >
            Logout
          </button>
        </>
      );
    }

    // For Tenants, Admins, etc.
    return (
      <>
        <Link
          href={`/dashboard/${user?.role || "tenant"}`}
          className="text-slate-600 font-medium hover:text-primary transition-colors"
        >
          Dashboard
        </Link>
        <button
          onClick={logout}
          className="text-slate-500 hover:text-red-500 font-medium transition-colors"
        >
          Logout
        </button>
      </>
    );
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* ✅ UPDATED LOGO SECTION */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <Image
                src="/images/logo.png" // ✅ Points to public/images/logo.png
                alt="Tennacy Logo"
                width={140} // Adjust this width if your logo is bigger/smaller
                height={40} // Adjust this height if needed
                className="object-contain"
                priority // ✅ Loads the logo immediately for better LCP (Largest Contentful Paint) score
              />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link
              href="/marketplace?category=rental"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
            >
              Rent
            </Link>
            <Link
              href="/marketplace?category=sale"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
            >
              Buy
            </Link>
            <Link
              href="/marketplace?category=short_stay"
              className="text-slate-600 hover:text-primary font-medium transition-colors"
            >
              Short Stay
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {renderAuthButtons()}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-slate-500 hover:text-primary focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/marketplace?category=rental"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50"
            >
              Rent
            </Link>
            <Link
              href="/marketplace?category=sale"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50"
            >
              Buy
            </Link>
            <Link
              href="/marketplace?category=short_stay"
              className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50"
            >
              Short Stay
            </Link>

            <div className="pt-4 pb-3 border-t border-slate-200 space-y-2">
              {/* ✅ Mobile Auth Buttons (Also protected by hasMounted to prevent mismatch) */}
              {hasMounted &&
                isAuthenticated &&
                (user?.role === "landlord" || user?.role === "agency") && (
                  <Link
                    href="/properties/wizard"
                    className="flex items-center gap-2 px-3 py-2 rounded-md text-base font-semibold text-primary bg-primary/5 border border-primary/10"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                    Add Property
                  </Link>
                )}

              {hasMounted && isAuthenticated ? (
                <button
                  onClick={logout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium text-secondary hover:bg-slate-50"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
