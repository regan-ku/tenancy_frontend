"use client";

import React, { useState, useEffect } from "react";
import {
  adminMarketplaceApi,
  MarketplaceListing,
} from "@/api/adminMarketplace.api";
import ListingReviewPanel from "@/components/admin/ListingReviewPanel";
export default function AdminMarketplacePage() {
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const [reviewingListing, setReviewingListing] =
    useState<MarketplaceListing | null>(null);

  useEffect(() => {
    adminMarketplaceApi.getAllListings().then((data) => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const formatCurrency = (amount: number) => `KES ${amount.toLocaleString()}`;

  const filteredListings = listings.filter((l) => {
    const matchesStatus = statusFilter === "all" || l.status === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || l.category === categoryFilter;
    const matchesSearch =
      l.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.owner_name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      hidden: "bg-slate-100 text-slate-600",
      pending_review: "bg-yellow-100 text-yellow-700",
      flagged: "bg-red-100 text-red-700",
      unpublished: "bg-slate-100 text-slate-500",
    };
    return colors[status] || "bg-slate-100 text-slate-600";
  };

  const handleModerationUpdate = (
    id: number,
    newStatus: string,
    isFeatured: boolean,
  ) => {
    setListings(
      listings.map((l) =>
        l.id === id
          ? { ...l, status: newStatus as any, is_featured: isFeatured }
          : l,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary-dark">
          Marketplace Operations & Moderation
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Oversee all public listings, manage featured placements, and moderate
          content quality across the platform.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Total Active Listings"
          value={listings.filter((l) => l.status === "active").length}
          icon="🏢"
          color="bg-green-50 text-green-600"
        />
        <KPICard
          title="Pending Review"
          value={listings.filter((l) => l.status === "pending_review").length}
          icon="⏳"
          color="bg-yellow-50 text-yellow-600"
        />
        <KPICard
          title="Flagged / Hidden"
          value={
            listings.filter(
              (l) => l.status === "flagged" || l.status === "hidden",
            ).length
          }
          icon="🚩"
          color="bg-red-50 text-red-600"
        />
        <KPICard
          title="Featured Properties"
          value={listings.filter((l) => l.is_featured).length}
          icon="⭐"
          color="bg-purple-50 text-purple-600"
        />
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
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
            placeholder="Search listing title or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-medium"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active (Public)</option>
          <option value="pending_review">Pending Review</option>
          <option value="hidden">Hidden by Owner</option>
          <option value="flagged">Flagged by System</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none font-medium capitalize"
        >
          <option value="all">All Categories</option>
          <option value="rental">Rentals</option>
          <option value="sale">For Sale</option>
          <option value="short_stay">Short Stay</option>
        </select>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Listing & Media</th>
                <th className="px-6 py-4">Owner / Agency</th>
                <th className="px-6 py-4">Category & Price</th>
                <th className="px-6 py-4">Status & Visibility</th>
                <th className="px-6 py-4">Performance</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    Loading marketplace data...
                  </td>
                </tr>
              ) : filteredListings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    No listings match your filters.
                  </td>
                </tr>
              ) : (
                filteredListings.map((listing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                          {/* Note: In production, use getMediaUrl(listing.cover_photo) */}
                          <div className="w-full h-full bg-primary/10 flex items-center justify-center text-primary text-xl">
                            🏠
                          </div>
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {listing.title}
                            {listing.is_featured && (
                              <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold">
                                FEATURED
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-slate-500">
                            {listing.location} • {listing.media_count} Media
                            Files
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-700 text-xs">
                        {listing.owner_name}
                      </p>
                      <span
                        className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${listing.owner_type === "agency" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                      >
                        {listing.owner_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded capitalize">
                        {listing.category.replace("_", " ")}
                      </span>
                      <p className="text-sm font-bold text-primary-dark mt-1">
                        {formatCurrency(listing.price)}
                        <span className="text-xs text-slate-400 font-normal">
                          /{listing.price_period || "unit"}
                        </span>
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${getStatusBadge(listing.status)}`}
                      >
                        {listing.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600">
                      <p>
                        <span className="font-bold text-slate-800">
                          {listing.total_views}
                        </span>{" "}
                        Views
                      </p>
                      <p>
                        <span className="font-bold text-slate-800">
                          {listing.total_saves}
                        </span>{" "}
                        Saves
                      </p>
                      <p>
                        <span className="font-bold text-slate-800">
                          {listing.total_inquiries}
                        </span>{" "}
                        Inquiries
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setReviewingListing(listing)}
                        className="text-xs bg-primary text-white px-4 py-1.5 rounded-lg font-bold hover:bg-primary/90"
                      >
                        Review & Moderate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Panel */}
      {reviewingListing && (
        <ListingReviewPanel
          listing={reviewingListing}
          onClose={() => setReviewingListing(null)}
          onUpdate={handleModerationUpdate}
        />
      )}
    </div>
  );
}

function KPICard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
      <div className="flex justify-between items-start mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
        {title}
      </p>
      <p className="text-2xl font-extrabold text-primary-dark mt-1">{value}</p>
    </div>
  );
}
