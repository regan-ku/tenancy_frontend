"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

// TODO: Update this import to match your actual landlord API file and interface names
import {
  landlordPropertiesApi,
  LandlordProperty,
} from "@/api/landlordProperties.api";

export default function LandlordPropertiesPage() {
  const [properties, setProperties] = useState<LandlordProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "self_managed" | "delegated">(
    "all",
  );

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      // TODO: Ensure this method exists in your landlord API
      const data = await landlordPropertiesApi.getProperties();
      setProperties(data);
    } catch (error) {
      console.error("Failed to fetch properties", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper to determine if a property is delegated (Adjust based on your DB schema)
  const isPropertyDelegated = (p: LandlordProperty) => {
    return (
      p.is_delegated || !!p.agency_name || p.delegation_status === "active"
    );
  };

  const filteredProperties = properties.filter((p) => {
    if (filter === "all") return true;
    if (filter === "delegated") return isPropertyDelegated(p);
    if (filter === "self_managed") return !isPropertyDelegated(p);
    return true;
  });

  const getManagementBadge = (prop: LandlordProperty) => {
    if (isPropertyDelegated(prop)) {
      return (
        <div className="flex flex-col gap-1 items-end">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 uppercase">
            Delegated
          </span>
          {prop.agency_name && (
            <span className="text-[10px] text-slate-500 font-medium truncate max-w-[100px]">
              to {prop.agency_name}
            </span>
          )}
        </div>
      );
    }

    return (
      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 uppercase">
        Self-Managed
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            My Properties
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage and monitor your real estate portfolio.
          </p>
        </div>
        <Link
          href="/properties/wizard"
          className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90 transition-colors"
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
          Add New Property
        </Link>
      </div>

      {/* Filters */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit">
        {(
          [
            { key: "all", label: "All Properties" },
            { key: "self_managed", label: "Self-Managed" },
            { key: "delegated", label: "Delegated" },
          ] as const
        ).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-5 py-2 text-xs font-bold rounded-lg transition-all ${
              filter === f.key
                ? "bg-white text-primary-dark shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {f.label}
            <span className="ml-2 text-slate-400">
              (
              {
                properties.filter((p) => {
                  if (f.key === "all") return true;
                  if (f.key === "delegated") return isPropertyDelegated(p);
                  return !isPropertyDelegated(p);
                }).length
              }
              )
            </span>
          </button>
        ))}
      </div>

      {/* Properties Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="h-72 bg-slate-100 animate-pulse rounded-2xl"
              ></div>
            ))}
        </div>
      ) : filteredProperties.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No properties found
          </h3>
          <p className="text-slate-500 text-sm mt-1 mb-6 text-center max-w-xs">
            {filter === "all"
              ? "Get started by adding your first property to your portfolio."
              : "No properties match the current filter."}
          </p>
          {filter === "all" && (
            <Link
              href="/properties/wizard"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold py-2.5 px-5 rounded-lg shadow-md hover:bg-primary/90"
            >
              Add Your First Property
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                    {prop.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 truncate">
                    <svg
                      className="w-3 h-3 flex-shrink-0 text-slate-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="truncate">{prop.location}</span>
                  </p>
                </div>
                {getManagementBadge(prop)}
              </div>

              {/* Card Body (Stats) */}
              <div className="p-5 grid grid-cols-2 gap-4 flex-1">
                <div className="bg-slate-50 p-3 rounded-xl">
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Total Units
                  </p>
                  <p className="text-2xl font-extrabold text-primary-dark mt-1">
                    {prop.total_units || 0}
                  </p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl">
                  <p className="text-[10px] text-emerald-600 uppercase font-bold tracking-wider">
                    Occupancy
                  </p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">
                    {prop.occupancy_rate ?? 0}%
                  </p>
                </div>
              </div>

              {/* Card Footer (Actions) */}
              <div className="p-4 bg-slate-50/50 border-t border-slate-100 space-y-2">
                <Link
                  href={`/dashboard/landlord/properties/${prop.id}`} // Adjust route if your structure differs
                  className="block w-full text-center bg-primary text-white hover:bg-primary/90 text-xs font-bold py-2.5 rounded-lg transition-colors shadow-sm"
                >
                  Manage Property →
                </Link>

                {/* Quick link if the property is delegated to an agency */}
                {isPropertyDelegated(prop) && (
                  <Link
                    href={`/dashboard/landlord/delegations/${prop.id}`} // Adjust route if needed
                    className="block w-full text-center bg-white border border-slate-200 hover:border-indigo-500 text-indigo-600 hover:bg-indigo-50 text-xs font-bold py-2.5 rounded-lg transition-colors"
                  >
                    View Delegation Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
