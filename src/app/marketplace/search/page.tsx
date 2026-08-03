"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import ListingCard from "@/components/ui/ListingCard";
import { Listing } from "@/api/marketplace.api";

// ✅ Next.js App Router requires useSearchParams to be wrapped in Suspense
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // ✅ Extract URL parameters pushed from the Homepage
  const query = searchParams.get("q") || "";
  const propertyType = searchParams.get("property_type") || "";
  const unitType = searchParams.get("unit_type") || "";
  const minPrice = searchParams.get("min_price") || "";
  const maxPrice = searchParams.get("max_price") || "";

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        // Rebuild the query string for the backend API
        const params = new URLSearchParams();
        if (query) params.append("q", query);
        if (propertyType) params.append("property_type", propertyType);
        if (unitType) params.append("unit_type", unitType);
        if (minPrice) params.append("min_price", minPrice);
        if (maxPrice) params.append("max_price", maxPrice);

        // Call the backend SearchService endpoint
        const response = await apiClient.get(
          `${endpoints.MARKETPLACE.SEARCH}?${params.toString()}`
        );
        
        // Backend returns { count: X, results: [...] }
        setListings(response.data.results || []);
        setTotalCount(response.data.count || 0);
      } catch (error) {
        console.error("Failed to fetch search results", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // Re-fetch if URL parameters change

  // Helper to format the header title based on active filters
  const formatFilters = () => {
    const parts = [];
    if (query) parts.push(`"${query}"`);
    if (propertyType) parts.push(propertyType.replace("_", " "));
    if (unitType) parts.push(unitType.replace("_", " "));
    return parts.length > 0 ? parts.join(" • ") : "All Properties";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/")} 
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Back to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 capitalize">
                {formatFilters()}
              </h1>
              <p className="text-sm text-slate-500">
                {loading ? "Searching..." : `${totalCount} properties found`}
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push("/")} 
            className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors hidden sm:block"
          >
            Modify Search
          </button>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          // Loading Skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-pulse">
                <div className="h-56 bg-slate-200"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                  <div className="h-8 bg-slate-200 rounded w-1/3 mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          // Actual Results
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          // Empty State
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No properties found</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-6">
              We couldn't find any properties matching your exact criteria. Try adjusting your filters or broadening your search area.
            </p>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
            >
              Start New Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ Export with Suspense boundary (Required by Next.js for useSearchParams)
export default function SearchResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <SearchResultsContent />
    </Suspense>
  );
}