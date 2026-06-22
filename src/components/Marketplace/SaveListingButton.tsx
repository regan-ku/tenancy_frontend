"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { marketplaceApi } from "@/api/marketplace.api";

interface SaveListingButtonProps {
  listingId: number;
}

export default function SaveListingButton({
  listingId,
}: SaveListingButtonProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the parent Link click

    if (!isAuthenticated) {
      router.push(
        `/login?redirect=/marketplace/listings/${listingId}&action=save`,
      );
      return;
    }

    setIsLoading(true);
    try {
      if (isSaved) {
        // In a real app, you'd track the savedId to delete it.
        // For now, we'll just toggle the UI state for the demo.
        setIsSaved(false);
      } else {
        await marketplaceApi.saveListing(listingId);
        setIsSaved(true);
      }
    } catch (error) {
      console.error("Failed to save listing", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleSave}
      disabled={isLoading}
      className={`p-2 rounded-full transition-all duration-200 shadow-sm border ${
        isSaved
          ? "bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
          : "bg-white border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200"
      }`}
      title={isSaved ? "Remove from saved" : "Save to watchlist"}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-slate-300 border-t-primary rounded-full animate-spin"></div>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={isSaved ? "currentColor" : "none"}
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      )}
    </button>
  );
}
