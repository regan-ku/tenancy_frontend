"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ListingDetail } from "@/api/marketplace.api";
import { useAuthStore } from "@/store/auth.store";

interface PropertyInfoCardProps {
  listing: ListingDetail;
  hasUnitGroups: boolean;
}

export default function PropertyInfoCard({
  listing,
  hasUnitGroups,
}: PropertyInfoCardProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [isSaved, setIsSaved] = useState(false);

  // ✅ Smooth scroll to Unit Groups section
  const handleScrollToUnits = () => {
    const element = document.getElementById("unit-groups-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // ✅ Apply for single-unit property (no unit groups)
  const handleApply = () => {
    const applicationUrl = `/applications/rental?property_id=${listing.property}`;
    if (!isAuthenticated) {
      router.push(`/login?redirect=${encodeURIComponent(applicationUrl)}`);
    } else {
      router.push(applicationUrl);
    }
  };

  // ✅ Save/Unsave listing
  const handleSave = () => {
    if (!isAuthenticated) {
      router.push(
        `/login?redirect=${encodeURIComponent(window.location.pathname)}`,
      );
    } else {
      setIsSaved(!isSaved);
    }
  };

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return isNaN(num) ? "Price on Request" : `KES ${num.toLocaleString()}`;
  };

  const amenitiesList = React.useMemo(() => {
    const amenities = listing.property_details?.amenities;
    if (!amenities) return [];
    if (Array.isArray(amenities)) return amenities;
    return Object.entries(amenities)
      .filter(([_, value]) => value === true || value === "true")
      .map(([key]) =>
        key
          .replace(/_/g, " ")
          .replace(/^has\s+/i, "")
          .replace(/\b\w/g, (l) => l.toUpperCase()),
      );
  }, [listing.property_details?.amenities]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 lg:sticky lg:top-24">
      {/* Pricing Section */}
      <div className="mb-6 pb-6 border-b border-slate-100">
        <p className="text-sm text-slate-500 uppercase font-semibold mb-1">
          Starting from
        </p>
        <p className="text-3xl font-bold text-secondary">
          {formatPrice(listing.min_rent_amount)}
          {listing.price_period && (
            <span className="text-lg text-slate-400 font-normal">
              /{listing.price_period}
            </span>
          )}
        </p>
      </div>

      {/* Unit Availability Section */}
      {listing.unit_group_availability && !hasUnitGroups && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="font-semibold text-primary-dark mb-3 flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5 text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Availability
          </h3>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-600">Available Units:</span>
            <span className="font-bold text-green-600">
              {listing.unit_group_availability.available_units}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total Units:</span>
            <span className="font-bold">
              {listing.unit_group_availability.total_units}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
            <div
              className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
              style={{
                width: `${(listing.unit_group_availability.available_units / listing.unit_group_availability.total_units) * 100}%`,
              }}
            ></div>
          </div>
        </div>
      )}

      {/* Amenities Section */}
      <div className="mb-6">
        <h3 className="font-semibold text-primary-dark mb-3">Amenities</h3>
        {amenitiesList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {amenitiesList.map((amenity, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full"
              >
                {amenity}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm italic">No amenities listed</p>
        )}
      </div>

      {/* ✅ CONDITIONAL ACTION BUTTONS */}
      <div className="space-y-3">
        {hasUnitGroups ? (
          // ✅ Active scroll button instead of passive text
          <button
            onClick={handleScrollToUnits}
            className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            View Available Unit Groups
          </button>
        ) : (
          <>
            <button
              onClick={handleApply}
              className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              {isAuthenticated ? "Apply Now" : "Sign In to Apply"}
            </button>
            <button className="w-full border-2 border-slate-200 hover:border-primary text-slate-700 hover:text-primary font-bold py-3 rounded-xl transition-all">
              Contact Manager
            </button>
          </>
        )}
      </div>

      {/* Save/Bookmark Toggle */}
      <button
        onClick={handleSave}
        className={`w-full mt-4 font-medium text-sm flex items-center justify-center gap-2 transition-colors py-2.5 rounded-xl border ${
          isSaved
            ? "bg-secondary/10 border-secondary text-secondary"
            : "border-slate-200 text-slate-500 hover:text-secondary hover:border-secondary/50"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill={isSaved ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z"
          />
        </svg>
        {isSaved ? "Saved to Watchlist" : "Save Listing"}
      </button>
    </div>
  );
}
