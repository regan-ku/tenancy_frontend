"use client";

import React, { useState, useEffect } from "react";
import { marketplaceApi, Listing } from "@/api/marketplace.api";
import ListingCard from "@/components/ui/ListingCard";
import SearchFilters from "@/components/Marketplace/SearchFilters";

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  // Initial fetch
  useEffect(() => {
    fetchListings({});
  }, []);

  const fetchListings = async (filters: Record<string, any>) => {
    setIsLoading(true);
    setError(null);
    try {
      // Remove empty filters before sending to API
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== ""),
      );

      const data = await marketplaceApi.getListings(cleanFilters);
      setListings(data.results);
      setTotalCount(data.count);
    } catch (err: any) {
      setError("Failed to load listings. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">
          Explore Properties
        </h1>
        <p className="text-slate-500">
          {isLoading
            ? "Searching..."
            : `Found ${totalCount} properties matching your criteria.`}
        </p>
      </div>

      {/* Search Filters */}
      <div className="mb-10">
        <SearchFilters onSearch={fetchListings} />
      </div>

      {/* Results Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-96 animate-pulse border border-slate-100"
            ></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-20 bg-red-50 rounded-2xl text-red-600">
          <p className="font-medium">{error}</p>
        </div>
      ) : listings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl">
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            No properties found
          </h3>
          <p className="text-slate-500">Try adjusting your search filters.</p>
        </div>
      )}
    </div>
  );
}
