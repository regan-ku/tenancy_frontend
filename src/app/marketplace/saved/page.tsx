"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { marketplaceApi, SavedListing } from "@/api/marketplace.api";
import ListingCard from "@/components/ui/ListingCard";

export default function SavedListingsPage() {
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      setIsLoading(true);
      try {
        const data = await marketplaceApi.getSavedListings();
        setSavedListings(data.results);
      } catch (error) {
        console.error("Failed to fetch saved listings", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSaved();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark mb-2">
          My Saved Properties
        </h1>
        <p className="text-slate-500">
          {isLoading
            ? "Loading your watchlist..."
            : `You have ${savedListings.length} saved properties.`}
        </p>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl h-96 animate-pulse border border-slate-100"
            ></div>
          ))}
        </div>
      ) : savedListings.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {savedListings.map((saved) => (
            <ListingCard key={saved.id} listing={saved.listing_details} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-2xl border border-slate-100">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-16 h-16 text-slate-300 mx-auto mb-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
            />
          </svg>
          <h3 className="text-xl font-bold text-primary-dark mb-2">
            No saved properties yet
          </h3>
          <p className="text-slate-500 mb-6">
            Start browsing the marketplace and click the heart icon to save
            properties you love.
          </p>
          <Link
            href="/marketplace"
            className="btn-primary px-6 py-2 rounded-lg"
          >
            Browse Marketplace
          </Link>
        </div>
      )}
    </div>
  );
}
