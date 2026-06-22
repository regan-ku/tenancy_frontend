"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { PublicUnitGroup, PublicMedia } from "@/api/marketplace.api";
import { getMediaUrl } from "@/utils/media";
import MediaLightbox from "./MediaLightbox";

interface UnitGroupsSectionProps {
  unitGroups: PublicUnitGroup[];
  groupedMedia: Record<number, PublicMedia[]>;
  propertyId: number;
}

export default function UnitGroupsSection({
  unitGroups,
  groupedMedia,
  propertyId,
}: UnitGroupsSectionProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [lightboxMedia, setLightboxMedia] = useState<PublicMedia[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const formatPrice = (price: string | number) => {
    const num = typeof price === "string" ? parseFloat(price) : price;
    return isNaN(num) ? "0" : `KES ${num.toLocaleString()}`;
  };

  const openLightbox = (media: PublicMedia[], index: number) => {
    setLightboxMedia(media);
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // ✅🚨 AUTHENTICATION GATEWAY: Handles routing based on login status
  const handleApplyClick = (groupId: number) => {
    const applicationUrl = `/applications/rental?property_id=${propertyId}&unit_group_id=${groupId}`;

    if (!isAuthenticated) {
      // Not logged in -> Send to login with a redirect back to the wizard
      router.push(`/login?redirect=${encodeURIComponent(applicationUrl)}`);
    } else {
      // Logged in -> Go straight to the application wizard
      router.push(applicationUrl);
    }
  };

  if (unitGroups.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Available Unit Groups
        </h2>
        <p className="text-slate-500">
          Select a unit type to view specific details and apply.
        </p>
      </div>

      <div className="space-y-8">
        {unitGroups.map((group) => {
          const media = groupedMedia[group.id] || [];
          const images = media.filter(
            (m) => m.media_type === "image" && m.file,
          );

          // Calculate Estimated Move-in Cost
          const baseRent = parseFloat(group.base_rent_amount) || 0;
          const deposit = parseFloat(group.deposit_amount) || 0;
          const serviceCharge = parseFloat(group.service_charge_amount) || 0;
          const estimatedTotal = baseRent + deposit + serviceCharge;

          const mainImage =
            images.length > 0
              ? getMediaUrl(images[0].file)
              : getMediaUrl(group.cover_photo);

          // ✅ FIX: Format the UNIT TYPE (e.g., "one_bedroom" -> "One Bedroom")
          // instead of using the user-inputted group name.
          const formattedUnitType = group.unit_type
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          return (
            <div
              key={group.id}
              className="border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* CLICKABLE UNIT GROUP HEADER IMAGE */}
              {mainImage && (
                <div
                  onClick={() =>
                    images.length > 0 ? openLightbox(images, 0) : null
                  }
                  className="relative h-72 bg-slate-100 cursor-pointer group"
                >
                  <img
                    src={mainImage}
                    alt={group.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Availability Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-primary-dark text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">
                    {group.capacity} Unit{group.capacity > 1 ? "s" : ""}{" "}
                    Available
                  </div>

                  {/* Hover Overlay */}
                  {images.length > 0 && (
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="bg-white/90 text-primary-dark px-4 py-2 rounded-full font-bold text-sm shadow-lg">
                        View {images.length} Photo
                        {images.length > 1 ? "s" : ""}
                      </span>
                    </div>
                  )}
                </div>
              )}

              <div className="p-6">
                {/* Header: Name & Price */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary-dark">
                      {group.name}
                    </h3>
                    <p className="text-sm text-slate-500 capitalize">
                      {formattedUnitType} • Floor(s): {group.floor_range}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-extrabold text-secondary">
                      {formatPrice(group.base_rent_amount)}
                    </p>
                    <p className="text-xs text-slate-500">
                      per {group.billing_cycle}
                    </p>
                  </div>
                </div>

                {/* ESTIMATED MOVE-IN COST */}
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
                  <p className="text-xs text-slate-500 uppercase font-bold mb-2">
                    Estimated Move-in Cost
                  </p>
                  <p className="text-2xl font-extrabold text-primary-dark mb-3">
                    {formatPrice(estimatedTotal)}
                  </p>
                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                      <p className="text-slate-400 mb-0.5">Rent</p>
                      <p className="font-bold text-slate-700">
                        {formatPrice(baseRent)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                      <p className="text-slate-400 mb-0.5">Deposit</p>
                      <p className="font-bold text-slate-700">
                        {formatPrice(deposit)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg p-2 text-center border border-slate-100">
                      <p className="text-slate-400 mb-0.5">Service</p>
                      <p className="font-bold text-slate-700">
                        {formatPrice(serviceCharge)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {group.description && (
                  <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                    {group.description}
                  </p>
                )}

                {/* UNIT GROUP PHOTO GRID */}
                {images.length > 1 && (
                  <div className="mb-6">
                    <p className="text-xs font-bold text-slate-500 uppercase mb-3">
                      Unit Gallery
                    </p>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {images.slice(0, 4).map((img, idx) => (
                        <button
                          key={img.id}
                          onClick={() => openLightbox(images, idx)}
                          className="relative aspect-[4/3] rounded-lg overflow-hidden border border-slate-200 hover:border-primary/50 hover:opacity-90 transition-all"
                        >
                          <img
                            src={getMediaUrl(img.file) || ""}
                            alt={img.caption || "Unit"}
                            className="w-full h-full object-cover"
                          />
                          {idx === 3 && images.length > 4 && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-lg">
                              +{images.length - 4}
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full">
                    Billing: {group.billing_cycle}
                  </span>
                  {(group as any).allows_pets_override && (
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-3 py-1.5 rounded-full">
                      🐾 Pets Allowed
                    </span>
                  )}
                </div>

                {/* ✅ APPLY BUTTON (Now checks auth status and uses Unit Type) */}
                <button
                  onClick={() => handleApplyClick(group.id)}
                  className="block w-full text-center bg-secondary hover:bg-secondary/90 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg hover:shadow-xl"
                >
                  Apply for {formattedUnitType} →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* UNIT GROUP LIGHTBOX */}
      <MediaLightbox
        media={lightboxMedia}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={() =>
          setLightboxIndex((prev) => (prev + 1) % lightboxMedia.length)
        }
        onPrev={() =>
          setLightboxIndex(
            (prev) => (prev - 1 + lightboxMedia.length) % lightboxMedia.length,
          )
        }
      />
    </div>
  );
}
