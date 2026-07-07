"use client";

import React, { useState } from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";
import { useAuthStore } from "@/store/auth.store";
import { propertiesApi } from "@/api/properties.api";

export default function StepPublish() {
  const { formData, propertyId, isSubmitting, setSubmitting, resetWizard } =
    usePropertyWizardStore();
  const { user } = useAuthStore();

  const [publishToMarketplace, setPublishToMarketplace] = useState(true);
  const [listingType, setListingType] = useState<
    "rental" | "sale" | "short_stay"
  >("rental");
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handlePublish = async () => {
    setSubmitting(true);
    setError(null);

    try {
      if (!propertyId) {
        throw new Error("Property ID is missing. Cannot publish.");
      }

      // 1. Update backend
      await propertiesApi.updateProperty(propertyId, {
        is_active: true,
        is_published: publishToMarketplace,
        listing_type: publishToMarketplace ? listingType : null,
      });

      // 2. Show the full-screen success/redirect mask
      setIsRedirecting(true);

      // 3. Reset the Zustand store
      resetWizard();

      // 4. ✅ FIXED: Use window.location.href instead of router.push()
      // This forces a hard page reload which:
      // - Clears the stale wizard state from memory
      // - Triggers a fresh bootstrap process
      // - Re-fetches user state from backend
      // - Ensures middleware sees the correct "property created" status
      setTimeout(() => {
        const userRole = user?.role || "landlord";
        window.location.href = `/dashboard/${userRole}`;
      }, 1500); // Show success screen for 1.5 seconds before redirecting
    } catch (err: any) {
      setIsRedirecting(false);
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to publish property. Please try again.",
      );
      setSubmitting(false);
    }
  };

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <svg
            className="w-10 h-10 text-green-600"
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
          🎉 Property Created Successfully!
        </h2>
        <p className="text-slate-500 mt-2 text-lg">
          Redirecting to your dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary-dark mb-2">
          Ready to Publish?
        </h2>
        <p className="text-slate-500">
          Review your property details and choose your marketplace visibility.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center">
          {error}
        </div>
      )}

      {/* Property Summary */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
        <h3 className="font-bold text-primary-dark text-lg">
          Property Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-500">Title:</span>{" "}
            <p className="font-medium">{formData.title}</p>
          </div>
          <div>
            <span className="text-slate-500">Type:</span>{" "}
            <p className="font-medium capitalize">
              {formData.property_sub_type.replace(/_/g, " ")}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Location:</span>{" "}
            <p className="font-medium">
              {formData.location.city}, {formData.location.county}
            </p>
          </div>
          <div>
            <span className="text-slate-500">Capacity:</span>{" "}
            <p className="font-medium">{formData.total_units_capacity} Units</p>
          </div>
        </div>
      </div>

      {/* Marketplace Toggle */}
      <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-primary-dark">
              List on Public Marketplace?
            </h3>
            <p className="text-sm text-slate-500">
              Make this property visible to the public for discovery and
              applications.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={publishToMarketplace}
              onChange={(e) => setPublishToMarketplace(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary"></div>
          </label>
        </div>

        {publishToMarketplace && (
          <div className="animate-in fade-in slide-in-from-top-2">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Listing Type
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(["rental", "sale", "short_stay"] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setListingType(type)}
                  className={`p-3 rounded-lg border text-sm font-medium capitalize transition-all ${
                    listingType === type
                      ? "border-secondary bg-secondary/10 text-secondary shadow-sm"
                      : "border-slate-200 hover:border-primary/50 text-slate-600"
                  }`}
                >
                  {type.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Final Action */}
      <button
        onClick={handlePublish}
        disabled={isSubmitting}
        className="w-full btn-primary py-4 text-lg font-bold shadow-lg disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            Processing...
          </>
        ) : publishToMarketplace ? (
          "🚀 Publish to Marketplace"
        ) : (
          "🔒 Keep Private & Finish"
        )}
      </button>
    </div>
  );
}
