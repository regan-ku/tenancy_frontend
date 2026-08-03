// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { marketplaceApi, Listing } from "@/api/marketplace.api";
import ListingCard from "@/components/ui/ListingCard";
import { useAuthStore } from "@/store/auth.store";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Data States
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search States (Aligned perfectly with Backend MarketplaceSearchFilter)
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [searchUnitType, setSearchUnitType] = useState("");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");

  // ✅ Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
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

  // ✅ Handle Advanced Search Submission
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (searchPropertyType) params.set("property_type", searchPropertyType);
    if (searchUnitType) params.set("unit_type", searchUnitType);
    if (searchMinPrice) params.set("min_price", searchMinPrice);
    if (searchMaxPrice) params.set("max_price", searchMaxPrice);

    router.push(`/marketplace/search?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      
      {/* ✅ SMART TOP NAVIGATION BAR (Solves the "No way back to dashboard" issue) */}
      <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-slate-100 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <a href="/" className="text-2xl font-extrabold text-primary tracking-tight flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Tennacy
          </a>
          
          <nav className="flex items-center gap-3 md:gap-6">
            <a href="/marketplace" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors hidden sm:block">
              Marketplace
            </a>
            
            {isAuthenticated ? (
              <a 
                href="/dashboard" 
                className="text-sm font-semibold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                My Dashboard
              </a>
            ) : (
              <>
                <a href="/login" className="text-sm font-semibold text-slate-700 hover:text-primary transition-colors">
                  Login
                </a>
                <a href="/register" className="text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors shadow-sm">
                  Get Started
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* ✅ HERO SECTION & ADVANCED SEARCH */}
      <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-white overflow-hidden border-b border-slate-100">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-40 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-sky-200 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-800 tracking-tight mb-4">
            Find Your Perfect <span className="text-primary">Space</span>
          </h1>
          <p className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto mb-10">
            Discover rental homes, commercial spaces, and short stays across the country. Managed securely by verified landlords and agencies.
          </p>

          {/* ✅ ADVANCED SEARCH BAR (Mapped directly to Backend Filters) */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-4 md:p-6 text-left">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Row 1 */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  Location / Keyword
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g. Nairobi, Kilimani..."
                  className="w-full py-2.5 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Property Type</label>
                <select
                  value={searchPropertyType}
                  onChange={(e) => setSearchPropertyType(e.target.value)}
                  className="w-full py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg border border-slate-200 text-sm bg-slate-50 cursor-pointer"
                >
                  <option value="">Any Property</option>
                  <option value="residential">Residential</option>
                  <option value="commercial">Commercial</option>
                  <option value="mixed_use">Mixed Use</option>
                  <option value="hospitality">Short Stay</option>
                </select>
              </div>

              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Unit Type</label>
                <select
                  value={searchUnitType}
                  onChange={(e) => setSearchUnitType(e.target.value)}
                  className="w-full py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg border border-slate-200 text-sm bg-slate-50 cursor-pointer"
                >
                  <option value="">Any Unit</option>
                  <option value="single">Single Room</option>
                  <option value="bedsitter">Bedsitter</option>
                  <option value="one_bedroom">1 Bedroom</option>
                  <option value="two_bedroom">2 Bedroom</option>
                  <option value="commercial">Commercial Space</option>
                </select>
              </div>

              {/* Row 2 */}
              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Min Price</label>
                <input
                  type="number"
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  placeholder="KES"
                  className="w-full py-2.5 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div className="md:col-span-4 flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Max Price</label>
                <input
                  type="number"
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  placeholder="KES"
                  className="w-full py-2.5 px-3 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/20 rounded-lg border border-slate-200 text-sm bg-slate-50"
                />
              </div>

              <div className="md:col-span-4 flex items-end">
                <button
                  onClick={handleSearch}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-sm h-[42px]"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Search Properties
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Featured Listings Section */}
      {!loading && featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-white rounded-t-3xl shadow-sm border-t border-slate-100 flex-grow">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
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