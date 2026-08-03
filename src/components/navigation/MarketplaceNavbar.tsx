"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";
import { useRouter } from "next/navigation";

export default function MarketplaceNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();

  // ✅ Prevent Hydration Mismatch
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const isManager = user?.role === "landlord" || user?.role === "agency" || user?.role === "agent";

  return (
    <nav className="bg-white/95 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center group">
            <Image
              src="/images/logo.png" 
              alt="Tennacy Logo"
              width={130} 
              height={40} 
              className="object-contain transition-opacity group-hover:opacity-80"
              priority 
            />
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/marketplace?category=rental" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Rent
            </Link>
            <Link href="/marketplace?category=sale" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Buy
            </Link>
            <Link href="/marketplace?category=short_stay" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Short Stay
            </Link>
            <Link href="/marketplace" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
              Browse All
            </Link>
          </div>

          {/* Desktop Auth & Dashboard Buttons */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!hasMounted ? (
              // Skeleton to prevent hydration mismatch flash
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-slate-600">Sign In</span>
                <span className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold">Get Started</span>
              </div>
            ) : !isAuthenticated ? (
              <>
                <Link href="/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                  Sign In
                </Link>
                <Link href="/register" className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all">
                  Get Started
                </Link>
              </>
            ) : (
              <>
                {isManager && (
                  <Link 
                    href="/properties/wizard" 
                    className="flex items-center gap-2 text-primary border border-primary/20 hover:bg-primary/5 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Property
                  </Link>
                )}
                
                {/* ✅ PROMINENT DASHBOARD LINK */}
                <Link 
                  href="/dashboard" 
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-lg text-sm font-semibold shadow-sm transition-all"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                  Dashboard
                </Link>

                {/* Clean Icon Logout */}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg focus:outline-none transition-colors"
            >
              {isMobileMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <Link href="/marketplace?category=rental" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors">
              Rent
            </Link>
            <Link href="/marketplace?category=sale" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors">
              Buy
            </Link>
            <Link href="/marketplace?category=short_stay" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors">
              Short Stay
            </Link>
            <Link href="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-lg text-base font-medium text-slate-700 hover:text-primary hover:bg-slate-50 transition-colors">
              Browse All
            </Link>

            <div className="pt-4 mt-4 border-t border-slate-200 space-y-3">
              {!hasMounted ? (
                <div className="h-10 bg-slate-100 rounded-lg animate-pulse"></div>
              ) : !isAuthenticated ? (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-3 py-3 rounded-lg text-base font-semibold text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors">
                    Sign In
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center px-3 py-3 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all">
                    Get Started
                  </Link>
                </>
              ) : (
                <>
                  {isManager && (
                    <Link href="/properties/wizard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg text-base font-semibold text-primary border border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Property
                    </Link>
                  )}
                  
                  <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg text-base font-semibold text-white bg-primary hover:bg-primary/90 shadow-sm transition-all">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                    Go to Dashboard
                  </Link>

                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center justify-center gap-2 w-full px-3 py-3 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}