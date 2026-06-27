"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { marketplaceApi } from "@/api/marketplace.api";
import { PublicMedia, PublicUnitGroup } from "@/api/marketplace.api";
import MediaGallery from "@/components/Marketplace/MediaGallery";
import PropertyInfoCard from "@/components/Marketplace/PropertyInfoCard";
import UnitGroupsSection from "@/components/Marketplace/UnitGroupSection";

export default function ListingDetailPage() {
  const { id } = useParams();

  const [listing, setListing] = useState<any>(null);
  const [media, setMedia] = useState<PublicMedia[]>([]);
  const [groupedMedia, setGroupedMedia] = useState<
    Record<number, PublicMedia[]>
  >({});
  const [unitGroups, setUnitGroups] = useState<PublicUnitGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const listingData = await marketplaceApi.getListingDetail(Number(id));
        setListing(listingData);

        // ✅ Extract Unit Groups (Backend now provides accurate available_units counts)
        setUnitGroups(listingData.available_unit_groups || []);

        // Separate Media into main vs grouped
        const allMedia: PublicMedia[] = listingData.property_media || [];
        const mainMedia: PublicMedia[] = [];
        const grouped: Record<number, PublicMedia[]> = {};

        allMedia.forEach((m) => {
          if (m.unit_group) {
            if (!grouped[m.unit_group]) grouped[m.unit_group] = [];
            grouped[m.unit_group].push(m);
          } else {
            mainMedia.push(m);
          }
        });

        let displayMedia = mainMedia;
        if (displayMedia.length === 0) {
          const allGroupedImages = Object.values(grouped)
            .flat()
            .filter((m) => m.media_type === "image");
          displayMedia = allGroupedImages.slice(0, 5);
        }

        setMedia(displayMedia);
        setGroupedMedia(grouped);
      } catch (err: any) {
        setError(
          err.response?.data?.detail || "Failed to load property details.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-8">
          <div className="h-[450px] bg-slate-200 rounded-2xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-8 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
            <div className="h-[500px] bg-slate-200 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          {error || "Property not found"}
        </h2>
        <a href="/marketplace" className="text-secondary hover:underline">
          ← Back to Marketplace
        </a>
      </div>
    );
  }

  const lat = listing.property_details?.location?.latitude;
  const lng = listing.property_details?.location?.longitude;
  const hasUnitGroups = unitGroups.length > 0;

  // ✅ Calculate total available units across all groups for the summary badge
  const totalAvailableUnits = unitGroups.reduce(
    (sum, group) => sum + (group.available_units || 0),
    0,
  );
  const isMultiUnitProperty = unitGroups.length > 1 || totalAvailableUnits > 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-slate-500 mb-6">
          <a href="/marketplace" className="hover:text-primary">
            Marketplace
          </a>
          <span className="mx-2">/</span>
          <span className="text-slate-800 font-medium">
            {listing.property_details?.title || listing.title}
          </span>
        </nav>

        {/* Main Gallery */}
        <MediaGallery media={media} coverPhoto={listing.cover_photo} />

        {/* ✅ NEW: AVAILABILITY BADGE FOR MULTI-UNIT PROPERTIES */}
        {isMultiUnitProperty && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-green-800">
                High Availability
              </h3>
              <p className="text-sm text-green-700">
                This property has multiple units currently available for rent.
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-extrabold text-green-900">
                {totalAvailableUnits}
              </p>
              <p className="text-xs font-bold text-green-700 uppercase">
                Units Available
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* About */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">
                About This Property
              </h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                {listing.property_details?.description ||
                  "No description available."}
              </p>
            </div>

            {/* Location */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-primary-dark mb-4">
                Location
              </h2>
              <div className="flex items-start gap-3 text-slate-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-6 h-6 text-secondary flex-shrink-0 mt-0.5"
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
                <div className="flex-1">
                  <p className="font-medium text-slate-800">
                    {listing.location_summary || "Address not specified"}
                  </p>
                  {lat && lng && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-4 bg-primary/5 hover:bg-primary/10 text-primary font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
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
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                      View on Google Maps
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Unit Groups Section */}
            {hasUnitGroups && (
              <div id="unit-groups-section" className="scroll-mt-24">
                {/* Note: Ensure your UnitGroupsSection component displays the `available_units` property from the group object */}
                <UnitGroupsSection
                  unitGroups={unitGroups}
                  groupedMedia={groupedMedia}
                  propertyId={listing.property}
                />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Card */}
          <div className="lg:col-span-1">
            <PropertyInfoCard listing={listing} hasUnitGroups={hasUnitGroups} />
          </div>
        </div>
      </div>
    </div>
  );
}
