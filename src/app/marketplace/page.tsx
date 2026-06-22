"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { marketplaceApi, Listing } from "@/api/marketplace.api";
import ListingCard from "@/components/ui/ListingCard";

export default function MarketplaceHomePage() {
  const router = useRouter();

  // Data States
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // Search States
  const [searchLocation, setSearchLocation] = useState("");
  const [searchType, setSearchType] = useState("");

  // ✅ Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch featured and general listings in parallel for speed
        const [featuredRes, listingsRes] = await Promise.all([
          marketplaceApi.getFeaturedListings().catch(() => ({ results: [] })),
          marketplaceApi.getListings().catch(() => ({ results: [] })),
        ]);

        setFeatured(featuredRes.results || []);
        setListings(listingsRes.results || []);
      } catch (error) {
        console.error("Failed to fetch marketplace data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Handle Search Submission
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchLocation) params.set("q", searchLocation);
    if (searchType && searchType !== "Any Type") {
      params.set("property_type", searchType.toLowerCase());
    }

    // Navigate to the search results page with query parameters
    router.push(`/marketplace/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ✅ RESIZED HERO SECTION: Light Blue Theme, Compact Height */}
      <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-white overflow-hidden border-b border-slate-100">
        {/* Decorative background blobs - Light Blue Theme */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-sky-200 rounded-full blur-3xl"></div>
        </div>

        {/* Reduced padding to make it more compact */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-3">
            Find Your Perfect <span className="text-blue-600">Space</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-8">
            Discover rental homes, commercial spaces, and short stays across the
            country. Managed securely by verified landlords and agencies.
          </p>

          {/* Search Bar Component - Clean White with Blue Button */}
          <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Location
              </label>
              <input
                type="text"
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                placeholder="Nairobi, Kilimani..."
                className="w-full mt-1 text-slate-800 placeholder-slate-400 focus:outline-none text-sm"
              />
            </div>
            <div className="w-px bg-slate-200 hidden md:block"></div>
            <div className="flex-1 px-4 py-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide">
                Property Type
              </label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full mt-1 text-slate-800 focus:outline-none bg-transparent text-sm"
              >
                <option>Any Type</option>
                <option>Apartment</option>
                <option>House</option>
                <option>Office</option>
              </select>
            </div>
            <button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-lg transition-colors duration-200 shadow-sm flex items-center justify-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Featured Listings Section */}
      {!loading && featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-primary-dark">
                Featured Properties
              </h2>
              <p className="text-slate-500 mt-1 text-sm">
                Hand-picked spaces just for you.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {/* General Listings Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-primary-dark">
              Available Spaces
            </h2>
            <p className="text-slate-500 mt-1 text-sm">
              Browse all verified properties on the marketplace.
            </p>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-slate-100 animate-pulse rounded-2xl h-96"
              ></div>
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
            <p className="text-slate-500 text-lg">
              No properties available right now. Check back soon!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
