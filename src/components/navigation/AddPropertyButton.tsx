"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";

export default function AddPropertyButton() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  const handleClick = () => {
    // 1. If not logged in, send them to register
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }

    // 2. If logged in, but not a Landlord or Agency, block them
    if (user?.role !== "landlord" && user?.role !== "agency") {
      alert(
        "Only Landlords and Agencies can add properties. Please contact support to upgrade your account.",
      );
      return;
    }

    // 3. If they are a verified Landlord/Agency, take them to the wizard
    router.push("/properties/wizard");
  };

  return (
    <button
      onClick={handleClick}
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
    </button>
  );
}
