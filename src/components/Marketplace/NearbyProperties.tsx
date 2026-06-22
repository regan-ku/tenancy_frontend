"use client";

import React, { useState, useEffect } from "react";
import apiClient from "@/api/axios";
import { endpoints } from "@/config/endpoints";
import ListingCard from "@/components/ui/ListingCard";
import { Listing } from "@/api/marketplace.api";

interface NearbyPropertiesProps {
  latitude: string | number;
  longitude: string | number;
  radius?: number; // in km
}

export default function NearbyProperties({
  latitude,
  longitude,
  radius = 5,
}: NearbyPropertiesProps) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNearby = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get(endpoints.MARKETPLACE.NEARBY, {
          params: { lat: latitude, lng: longitude, radius: radius },
        });
        // Filter out the current property if it's in the results
        setListings(response.data.results || []);
      } catch (err) {
        console.error("Failed to fetch nearby properties", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (latitude && longitude) fetchNearby();
  }, [latitude, longitude, radius]);

  if (isLoading) {
    return (
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-primary-dark mb-6">
          Properties Nearby
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-80 bg-slate-100 rounded-2xl animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (listings.length === 0) return null;

  return (
    <div className="mt-12 pt-10 border-t border-slate-200">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">
            Explore Nearby
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Other great spaces within {radius}km of this location.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
