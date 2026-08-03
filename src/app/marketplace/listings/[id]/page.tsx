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
  const [groupedMedia, setGroupedMedia] = useState<Record<number, PublicMedia[]>>({});
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

        setUnitGroups(listingData.available_unit_groups || []);

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
        setError(err.response?.data?.detail || "Failed to load property details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-6 bg-slate-200 rounded w-1/4"></div>
            <div className="h-[400px] bg-slate-200 rounded-2xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-8 bg-slate-200 rounded w-3/4"></div>
                <div className="h-32 bg-slate-200 rounded-xl"></div>
                <div className="h-64 bg-slate-200 rounded-xl"></div>
              </div>
              <div className="lg:col-span-1 h-[400px] bg-slate-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-slate-100 p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {error || "Property not found"}
          </h2>
          <p className="text-slate-500 mb-6">
            We couldn't load the property details. Please try again or browse other listings.
          </p>
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  const lat = listing.property_details?.location?.latitude;
  const lng = listing.property_details?.location?.longitude;
  const hasUnitGroups = unitGroups.length > 0;

  const totalAvailableUnits = unitGroups.reduce(
    (sum, group) => sum + (group.available_units || 0),
    0
  );
  const isMultiUnitProperty = unitGroups.length > 1 || totalAvailableUnits > 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Premium Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 overflow-x-auto whitespace-nowrap pb-2">
          <a href="/marketplace" className="hover:text-primary font-medium transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Marketplace
          </a>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-none">
            {listing.property_details?.title || listing.title}
          </span>
        </nav>

        {/* Main Gallery */}
        <MediaGallery media={media} coverPhoto={listing.cover_photo} />

        {/* Header Section: Title & Quick Tags */}
        <div className="mt-8 mb-6">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {listing.property_details?.property_category && (
              <span className="px-3 py-1 bg-secondary/10 text-secondary text-xs font-bold rounded-full uppercase tracking-wide border border-secondary/20">
                {listing.property_details.property_category}
              </span>
            )}
            {listing.property_details?.is_single_unit_property === false && (
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wide border border-primary/20">
                Multi-Unit Property
              </span>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            {listing.property_details?.title || listing.title}
          </h1>
          <div className="flex items-center gap-2 mt-3 text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium text-slate-600">{listing.location_summary || "Location undisclosed"}</span>
          </div>
        </div>

        {/* ✅ REVAMPED: Premium Dark Availability Badge (No Green) */}
        {isMultiUnitProperty && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white shadow-lg border border-slate-700 mb-8">
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Multiple Units Available
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                </h3>
                <p className="text-sm text-slate-300 mt-1">
                  This property features various floor plans and unit types to choose from.
                </p>
              </div>
            </div>
            <div className="text-left sm:text-right bg-white/5 px-5 py-3 rounded-xl border border-white/10 w-full sm:w-auto">
              <p className="text-3xl font-extrabold text-white tracking-tight">
                {totalAvailableUnits}
              </p>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                Vacant Units
              </p>
            </div>
          </div>
        )}

        {/* ✅ RESPONSIVE GRID FIX: 
            On mobile: PropertyInfoCard is order-1 (shows first for better conversion).
            On desktop: PropertyInfoCard is order-2 (sidebar on the right). 
        */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 order-2 lg:order-1 space-y-8">
            
            {/* About Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">About This Property</h2>
              </div>
              <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                {listing.property_details?.description || "No description available for this property."}
              </p>
            </div>

            {/* Location Section */}
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-slate-900">Location & Surroundings</h2>
              </div>
              
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 mb-5">
                <p className="font-semibold text-slate-800 text-lg">
                  {listing.location_summary || "Address not specified"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                  {listing.property_details?.location?.city || ""}{listing.property_details?.location?.county ? `, ${listing.property_details.location.county}` : ""}
                </p>
              </div>

              {lat && lng && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  View on Google Maps
                </a>
              )}
            </div>

            {/* Unit Groups Section */}
            {hasUnitGroups && (
              <div id="unit-groups-section" className="scroll-mt-24">
                <UnitGroupsSection
                  unitGroups={unitGroups}
                  groupedMedia={groupedMedia}
                  propertyId={listing.property}
                />
              </div>
            )}
          </div>

          {/* Right Column: Sidebar Card (Sticky on Desktop, First on Mobile) */}
          <div className="lg:col-span-1 order-1 lg:order-2">
            <div className="lg:sticky lg:top-24 space-y-6">
              <PropertyInfoCard listing={listing} hasUnitGroups={hasUnitGroups} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}