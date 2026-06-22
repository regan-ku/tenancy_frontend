"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useAuthStore } from "@/store/auth.store";

interface TopbarProps {
  onMenuClick: () => void;
}

// ✅ POLYMORPHIC-AWARE HELPERS
const getDisplayName = (user: any) => {
  if (!user) return "User";
  if (user?.full_name && String(user.full_name).trim() !== "")
    return user.full_name;
  if (user?.first_name)
    return `${user.first_name} ${user.last_name || ""}`.trim();
  if (user?.name && (user?.registration_number || user?.contact_email))
    return user.name;
  if (user?.email) return user.email.split("@")[0];
  if (user?.contact_email) return user.contact_email.split("@")[0];
  if (user?.username) return user.username;
  return "User";
};

const getInitial = (user: any) => {
  const name = getDisplayName(user);
  return name === "User" ? "U" : name.charAt(0).toUpperCase();
};

// ✅ DYNAMIC ROLE-BASED ROUTING HELPERS
const getDashboardBase = (user: any) => {
  const role = user?.role || user?.user_type || "tenant";
  const basePaths: Record<string, string> = {
    tenant: "/dashboard/tenant",
    landlord: "/dashboard/landlord",
    agency: "/dashboard/agency",
    admin: "/dashboard/admin",
    agent: "/dashboard/agency", // Agents operate under Agency dashboard
    caretaker: "/dashboard/agency", // Caretakers operate under Agency dashboard
  };
  return basePaths[role] || "/dashboard";
};

const getRoleRoute = (user: any, type: "profile" | "settings") => {
  const base = getDashboardBase(user);
  const role = user?.role || user?.user_type || "tenant";

  // In our architecture, "Profile" is a tab inside "Settings" for Tenant, Agency, Admin, and Landlord.
  if (
    type === "profile" &&
    ["tenant", "agency", "admin", "landlord"].includes(role)
  ) {
    return `${base}/settings`;
  }

  return `${base}/${type}`;
};

export default function LandlordTopbar({ onMenuClick }: TopbarProps) {
  const router = useRouter();
  const { user, logout, isLoading } = useAuthStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  const displayName = getDisplayName(user);
  const initial = getInitial(user);
  const userEmail =
    (user as any)?.email || (user as any)?.contact_email || "No Email";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      )
        setIsProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(event.target as Node))
        setIsNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-20">
      {/* Left Side */}
      <div className="flex items-center gap-4 flex-1">
        <Link href="/" className="flex items-center gap-2 lg:hidden">
          <div className="relative w-8 h-8">
            <Image
              src="/images/logo.png"
              alt="Tennacy"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="text-xl font-bold text-primary-dark hidden sm:block">
            Tennacy
          </span>
        </Link>

        <button
          onClick={onMenuClick}
          className="lg:hidden text-slate-500 hover:text-primary"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div className="relative max-w-md w-full hidden md:block">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search properties, tenants, invoices..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Notifications</h3>
                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                  2 New
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                <a
                  href="#"
                  className="block px-4 py-3 hover:bg-slate-50 border-b border-slate-50"
                >
                  <p className="text-sm font-medium text-slate-800">
                    New Rental Application
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    John Doe applied for Unit B-204.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">2 mins ago</p>
                </a>
                <a href="#" className="block px-4 py-3 hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-800">
                    Payment Received
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    KES 15,000 received for Unit A-101.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">1 hour ago</p>
                </a>
              </div>
              {/* ✅ DYNAMIC NOTIFICATIONS ROUTE */}
              <Link
                href={`${getDashboardBase(user)}/communications`}
                className="block text-center text-sm text-primary font-medium py-2 hover:bg-slate-50"
              >
                View All Notifications
              </Link>
            </div>
          )}
        </div>

        {/* ✅ BULLETPROOF Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2 p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary text-white font-bold flex items-center justify-center text-sm">
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                initial
              )}
            </div>
            <span className="hidden md:block text-sm font-medium text-slate-700">
              {isLoading ? "Loading..." : displayName}
            </span>
            <svg
              className="w-4 h-4 text-slate-400 hidden md:block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-slate-500 truncate">{userEmail}</p>
              </div>
              <div className="py-1">
                {/* ✅ DYNAMIC PROFILE ROUTE */}
                <Link
                  href={getRoleRoute(user, "profile")}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  My Profile
                </Link>

                {/* ✅ DYNAMIC SETTINGS ROUTE */}
                <Link
                  href={getRoleRoute(user, "settings")}
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Account Settings
                </Link>
              </div>
              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
