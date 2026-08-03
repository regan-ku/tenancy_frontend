// app/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { marketplaceApi, Listing } from "@/api/marketplace.api";
import ListingCard from "@/components/ui/ListingCard";

export default function Home() {
  const router = useRouter();

  // Data States
  const [featured, setFeatured] = useState<Listing[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Search States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchPropertyType, setSearchPropertyType] = useState("");
  const [searchUnitType, setSearchUnitType] = useState("");
  const [searchMinPrice, setSearchMinPrice] = useState("");
  const [searchMaxPrice, setSearchMaxPrice] = useState("");

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
      
      {/* ✅ COMPACT HERO SECTION & SEARCH */}
      <div className="relative bg-gradient-to-br from-blue-50 via-sky-50 to-white overflow-hidden border-b border-slate-100">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-200 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-80 h-80 bg-sky-200 rounded-full blur-3xl"></div>
        </div>

        {/* Reduced vertical padding for a tighter fit */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 text-center">
          <h1 className="text-2xl md:text-4xl font-extrabold text-slate-800 tracking-tight mb-2">
            Find Your Perfect <span className="text-primary">Space</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto mb-6">
            Discover rental homes, commercial spaces, and short stays across the country.
          </p>

          {/* ✅ COMPACT PILL-STYLE SEARCH BAR */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl md:rounded-full shadow-xl border border-slate-100 p-3 md:p-2 flex flex-col md:flex-row md:items-center gap-3 md:gap-0 text-left">
            
            {/* Location */}
            <div className="flex-1 relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="City, estate, or keyword..."
                className="w-full pl-9 pr-3 py-2.5 md:py-2 rounded-lg md:rounded-full bg-slate-50 md:bg-transparent border border-slate-200 md:border-none focus:ring-2 focus:ring-primary/20 focus:outline-none text-sm"
              />
            </div>

            {/* Selects Group */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-none md:flex md:items-center md:gap-0">
              <div className="h-6 w-px bg-slate-200 hidden md:block mx-2"></div>
              <select
                value={searchPropertyType}
                onChange={(e) => setSearchPropertyType(e.target.value)}
                className="w-full md:w-auto px-3 py-2.5 md:py-2 bg-slate-50 md:bg-transparent border border-slate-200 md:border-none rounded-lg md:rounded-full text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
              >
                <option value="">Property</option>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="mixed_use">Mixed Use</option>
                <option value="hospitality">Short Stay</option>
              </select>

              <div className="h-6 w-px bg-slate-200 hidden md:block mx-2"></div>
              <select
                value={searchUnitType}
                onChange={(e) => setSearchUnitType(e.target.value)}
                className="w-full md:w-auto px-3 py-2.5 md:py-2 bg-slate-50 md:bg-transparent border border-slate-200 md:border-none rounded-lg md:rounded-full text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer appearance-none"
              >
                <option value="">Unit Type</option>
                <option value="single_room">Single Room</option>
                <option value="bedsitter">Bedsitter</option>
                <option value="one_bedroom">1 Bedroom</option>
                <option value="two_bedroom">2 Bedrooms</option>
                <option value="commercial_space">Commercial</option>
              </select>
            </div>

            {/* Price & Button Group */}
            <div className="flex items-center gap-3 md:gap-2">
              <div className="h-6 w-px bg-slate-200 hidden md:block mx-2"></div>
              <div className="flex-1 md:flex-none flex items-center gap-2 bg-slate-50 md:bg-transparent border border-slate-200 md:border-none rounded-lg md:rounded-full px-3 py-1.5">
                <input 
                  type="number" 
                  value={searchMinPrice}
                  onChange={(e) => setSearchMinPrice(e.target.value)}
                  placeholder="Min" 
                  className="w-full md:w-16 px-1 py-1 bg-transparent text-sm focus:outline-none" 
                />
                <span className="text-slate-300 hidden md:block">|</span>
                <input 
                  type="number" 
                  value={searchMaxPrice}
                  onChange={(e) => setSearchMaxPrice(e.target.value)}
                  placeholder="Max" 
                  className="w-full md:w-16 px-1 py-1 bg-transparent text-sm focus:outline-none" 
                />
              </div>
              
              <button
                onClick={handleSearch}
                className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 md:py-2 rounded-lg md:rounded-full flex items-center justify-center gap-2 text-sm font-semibold shadow-md transition-all whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span className="hidden sm:inline">Search</span>
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Featured Listings Section */}
      {!loading && featured.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 bg-white rounded-t-3xl shadow-sm border-t border-slate-100 flex-grow">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-900">
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
                className="bg-slate-100 animate-pulse rounded-2xl h-80"
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