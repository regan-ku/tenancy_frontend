"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  agencyPropertiesApi,
  AgencyProperty,
} from "@/api/agencyProperties.api";

export default function AgencyPropertiesPage() {
  const [properties, setProperties] = useState<AgencyProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "owned" | "delegated">("all");

  // ✅ NEW: State for the Relinquish Modal
  const [relinquishingProperty, setRelinquishingProperty] =
    useState<AgencyProperty | null>(null);
  const [relinquishReason, setRelinquishReason] = useState("");
  const [relinquishConfirmText, setRelinquishConfirmText] = useState("");
  const [isRelinquishing, setIsRelinquishing] = useState(false);
  const [relinquishError, setRelinquishError] = useState("");

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const data = await agencyPropertiesApi.getManagedProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProperties = properties.filter((p) => {
    if (filter === "all") return true;
    return p.ownership_type === filter;
  });

  // ✅ NEW: Handle Relinquishment
  const handleRelinquish = async () => {
    if (relinquishConfirmText !== "RELINQUISH") {
      setRelinquishError("Please type 'RELINQUISH' exactly to confirm.");
      return;
    }
    if (!relinquishReason.trim()) {
      setRelinquishError(
        "Please provide a reason for relinquishing this property.",
      );
      return;
    }
    if (!relinquishingProperty?.delegation_id) {
      setRelinquishError("System error: Delegation ID missing.");
      return;
    }

    setIsRelinquishing(true);
    setRelinquishError("");
    try {
      await agencyPropertiesApi.relinquishProperty(
        relinquishingProperty.delegation_id,
        relinquishReason,
      );
      alert(
        "✅ Successfully relinquished property. The landlord has been notified.",
      );
      setRelinquishingProperty(null);
      setRelinquishReason("");
      setRelinquishConfirmText("");
      fetchProperties(); // Refresh the list
    } catch (error: any) {
      console.error("Failed to relinquish", error);
      setRelinquishError(
        error.response?.data?.error || "Failed to relinquish property.",
      );
    } finally {
      setIsRelinquishing(false);
    }
  };

  const getDelegationBadge = (prop: AgencyProperty) => {
    if (prop.ownership_type === "owned") {
      return (
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-primary/10 text-primary uppercase">
          Agency Owned
        </span>
      );
    }

    const colors = {
      full: "bg-green-100 text-green-700",
      partial: "bg-blue-100 text-blue-700",
      view_only: "bg-slate-100 text-slate-600",
    };

    return (
      <div className="flex flex-col gap-1">
        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 uppercase">
          Delegated
        </span>
        <span
          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${colors[prop.delegation_type || "view_only"]}`}
        >
          {prop.delegation_type?.replace("_", " ")} Access
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Managed Properties
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Overseeing {properties.length} properties across owned and delegated
            portfolios.
          </p>
        </div>
        <Link
          href="/properties/wizard"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Register New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {(["all", "owned", "delegated"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 text-xs font-bold rounded-lg capitalize transition-all ${
              filter === f
                ? "bg-white text-primary-dark shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f === "all"
              ? "All Properties"
              : f === "owned"
                ? "Agency Owned"
                : "Delegated"}
            <span className="ml-2 text-slate-400">
              (
              {
                properties.filter((p) =>
                  f === "all" ? true : p.ownership_type === f,
                ).length
              }
              )
            </span>
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array(6)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="h-64 bg-slate-100 animate-pulse rounded-2xl"
                ></div>
              ))
          : filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-slate-100 flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight">
                      {prop.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {prop.location}
                    </p>
                    {prop.landlord_name && (
                      <p className="text-[11px] text-slate-400 mt-2 font-medium">
                        Owner: {prop.landlord_name}
                      </p>
                    )}
                  </div>
                  {getDelegationBadge(prop)}
                </div>

                {/* Card Body (Stats) */}
                <div className="p-5 grid grid-cols-2 gap-4 flex-1">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Total Units
                    </p>
                    <p className="text-xl font-extrabold text-primary-dark">
                      {prop.total_units || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold">
                      Occupancy
                    </p>
                    <p className="text-xl font-extrabold text-green-600">
                      {prop.occupancy_rate ?? 0}%
                    </p>
                  </div>
                </div>

                {/* Card Footer (Actions) */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-2">
                  <Link
                    href={`/dashboard/agency/properties/${prop.id}`}
                    className="block w-full text-center bg-white border border-slate-200 hover:border-primary text-primary hover:bg-primary/5 text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    Manage Property →
                  </Link>

                  {/* ✅ NEW: Relinquish Button (Only shows for delegated properties) */}
                  {prop.ownership_type === "delegated" && (
                    <button
                      onClick={() => setRelinquishingProperty(prop)}
                      className="block w-full text-center bg-red-50 border border-red-200 hover:border-red-500 text-red-600 hover:bg-red-100 text-xs font-bold py-2.5 rounded-lg transition-colors"
                    >
                      Relinquish Delegation
                    </button>
                  )}
                </div>
              </div>
            ))}
      </div>

      {/* ✅ NEW: Relinquish Confirmation Modal */}
      {relinquishingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 bg-red-50">
              <h2 className="text-xl font-bold text-red-800">
                Relinquish Property Management
              </h2>
              <p className="text-sm text-red-600 mt-1">
                You are about to give up management of{" "}
                <strong>{relinquishingProperty.name}</strong>. All agency staff
                will lose access, and control will revert to the landlord.
              </p>
            </div>

            <div className="p-6 space-y-4">
              {relinquishError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 font-medium">
                  ⚠️ {relinquishError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Reason for Relinquishing *
                </label>
                <textarea
                  value={relinquishReason}
                  onChange={(e) => setRelinquishReason(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  placeholder="e.g., Contract ended, Landlord requested, Capacity issues..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                  Type{" "}
                  <span className="text-red-600 font-mono">RELINQUISH</span> to
                  confirm
                </label>
                <input
                  type="text"
                  value={relinquishConfirmText}
                  onChange={(e) =>
                    setRelinquishConfirmText(e.target.value.toUpperCase())
                  }
                  className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none font-mono tracking-widest"
                  placeholder="RELINQUISH"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setRelinquishingProperty(null);
                  setRelinquishError("");
                  setRelinquishReason("");
                  setRelinquishConfirmText("");
                }}
                className="px-6 py-2.5 text-slate-600 font-medium hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRelinquish}
                disabled={
                  isRelinquishing ||
                  relinquishConfirmText !== "RELINQUISH" ||
                  !relinquishReason.trim()
                }
                className="px-8 py-2.5 bg-red-600 text-white font-bold rounded-lg shadow-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isRelinquishing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Relinquishing...
                  </>
                ) : (
                  "Confirm Relinquishment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
