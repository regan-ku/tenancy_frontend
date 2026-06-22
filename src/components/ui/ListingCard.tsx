"use client";

import React from "react";
import Link from "next/link";
import { Listing } from "@/api/marketplace.api";

interface ListingCardProps {
  listing: Listing;
}

export default function ListingCard({ listing }: ListingCardProps) {
  // Format currency nicely (e.g., KES 15,000)
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    if (isNaN(num)) return "Price on Request";
    return `KES ${num.toLocaleString()}`;
  };

  // Capitalize listing type for the badge
  const listingTypeLabel = listing.listing_type
    .replace("_", " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <Link
      href={`/marketplace/listings/${listing.id}`}
      className="group block h-full"
    >
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Image Container */}
        <div className="relative h-52 bg-slate-200 overflow-hidden">
          {listing.cover_photo ? (
            <img
              src={listing.cover_photo}
              alt={listing.property_title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-100">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                />
              </svg>
            </div>
          )}

          {/* Listing Type Badge */}
          <div className="absolute top-3 left-3 bg-primary/90 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide backdrop-blur-sm shadow-sm">
            {listingTypeLabel}
          </div>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-grow">
          <h3 className="text-lg font-bold text-primary-dark truncate mb-2 group-hover:text-secondary transition-colors">
            {listing.property_title}
          </h3>

          <div className="flex items-center text-slate-500 text-sm mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4 mr-1 text-secondary"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
              />
            </svg>
            {listing.location_summary || "Location not specified"}
          </div>

          {/* Pushes price to the bottom */}
          <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">
                Starting from
              </p>
              <p className="text-xl font-bold text-secondary">
                {formatPrice(listing.min_rent_amount)}
                {listing.price_period && (
                  <span className="text-xs text-slate-400 font-normal">
                    /{listing.price_period}
                  </span>
                )}
              </p>
            </div>

            <button className="text-primary hover:text-secondary font-medium text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
              View
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
