"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  tenantMarketplaceApi,
  SavedProperty,
  ViewingRequest,
  MarketplaceApplication,
} from "@/api/tenantMarketplace.api";
import RequestViewingModal from "@/components/tenant/RequestViewingModal";

export default function TenantMarketplacePage() {
  const [activeTab, setActiveTab] = useState<
    "saved" | "viewings" | "applications"
  >("saved");

  const [savedProperties, setSavedProperties] = useState<SavedProperty[]>([]);
  const [viewings, setViewings] = useState<ViewingRequest[]>([]);
  const [applications, setApplications] = useState<MarketplaceApplication[]>(
    [],
  );
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showViewingModal, setShowViewingModal] = useState(false);
  const [selectedProperty, setSelectedProperty] =
    useState<SavedProperty | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [saved, view, apps] = await Promise.all([
        tenantMarketplaceApi.getSavedProperties(),
        tenantMarketplaceApi.getMyViewings(),
        tenantMarketplaceApi.getMarketplaceApplications(),
      ]);
      setSavedProperties(saved);
      setViewings(view);
      setApplications(apps);
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleRemoveSaved = async (listingId: number) => {
    if (confirm("Remove this property from your wishlist?")) {
      await tenantMarketplaceApi.removeSavedProperty(listingId);
      setSavedProperties(
        savedProperties.filter((p) => p.listing_id !== listingId),
      );
    }
  };

  const handleRequestViewing = (property: SavedProperty) => {
    setSelectedProperty(property);
    setShowViewingModal(true);
  };

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-dark">
            Marketplace Activity
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Track your saved properties, scheduled viewings, and marketplace
            applications.
          </p>
        </div>
        <Link
          href="/marketplace"
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
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          Browse Marketplace
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-6">
          {[
            {
              key: "saved",
              label: `Saved Properties (${savedProperties.length})`,
            },
            { key: "viewings", label: `My Viewings (${viewings.length})` },
            {
              key: "applications",
              label: `Marketplace Applications (${applications.length})`,
            },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.key ? "border-primary text-primary" : "border-transparent text-slate-500 hover:text-slate-700"}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* 1. SAVED PROPERTIES (WISHLIST) */}
        {activeTab === "saved" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedProperties.length === 0 ? (
              <div className="col-span-3 bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-4xl mb-2">🏠</p>
                <p className="text-slate-500 font-medium">
                  You haven't saved any properties yet.
                </p>
                <Link
                  href="/marketplace"
                  className="text-primary font-bold text-sm mt-2 inline-block hover:underline"
                >
                  Start Browsing →
                </Link>
              </div>
            ) : (
              savedProperties.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col"
                >
                  <div className="h-40 bg-slate-100 relative">
                    <div className="w-full h-full flex items-center justify-center text-4xl text-slate-300">
                      🖼️
                    </div>
                    <span className="absolute top-3 right-3 text-[10px] font-bold bg-white/90 text-slate-700 px-2 py-1 rounded shadow-sm">
                      {prop.property_type}
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {prop.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      {prop.location}
                    </p>
                    <p className="text-lg font-extrabold text-primary-dark mt-2">
                      {formatCurrency(prop.price)}
                      <span className="text-xs text-slate-400 font-normal">
                        /{prop.price_period}
                      </span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleRequestViewing(prop)}
                        className="py-2 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90"
                      >
                        📅 Request Viewing
                      </button>
                      <button
                        onClick={() => handleRemoveSaved(prop.listing_id)}
                        className="py-2 bg-red-50 text-red-600 text-xs font-bold rounded-lg hover:bg-red-100"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. SCHEDULED VIEWINGS */}
        {activeTab === "viewings" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Property</th>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Contact Preference</th>
                    <th className="px-6 py-4">Assigned Agent</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {viewings.map((v) => (
                    <tr
                      key={v.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {v.property_title}
                        </p>
                        <p className="text-xs text-slate-500">
                          {v.property_location}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium">
                        {v.preferred_date}{" "}
                        <span className="text-slate-400 text-xs">
                          @ {v.preferred_time}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-1 rounded uppercase">
                          {v.contact_channel.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {v.agent_name ? (
                          <div>
                            <p className="font-bold text-slate-800 text-xs">
                              {v.agent_name}
                            </p>
                            <p className="text-[10px] text-primary font-medium">
                              {v.agent_phone}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-yellow-600 font-bold">
                            Awaiting Assignment
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            v.status === "confirmed"
                              ? "bg-green-100 text-green-700"
                              : v.status === "pending"
                                ? "bg-yellow-100 text-yellow-700"
                                : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. MARKETPLACE APPLICATIONS */}
        {activeTab === "applications" && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                Pre-Tenancy Applications
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Track the status of applications submitted directly from the
                public marketplace.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Property & Unit</th>
                    <th className="px-6 py-4">Location</th>
                    <th className="px-6 py-4">Submitted</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-800">
                          {app.property_title}
                        </p>
                        <p className="text-xs text-slate-500">
                          Unit: {app.unit_code}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {app.location}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        {app.submitted_at}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                            app.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : app.status === "rejected"
                                ? "bg-red-100 text-red-700"
                                : app.status === "under_review"
                                  ? "bg-blue-100 text-blue-700"
                                  : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {app.status.replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Request Viewing Modal */}
      {showViewingModal && selectedProperty && (
        <RequestViewingModal
          property={selectedProperty}
          onClose={() => setShowViewingModal(false)}
          onSuccess={() => {
            setShowViewingModal(false);
            setActiveTab("viewings"); // Switch to viewings tab to show the new request
          }}
        />
      )}
    </div>
  );
}
