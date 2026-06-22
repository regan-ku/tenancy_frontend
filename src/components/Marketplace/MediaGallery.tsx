"use client";

import React, { useState, useMemo } from "react";
import { PublicMedia } from "@/api/marketplace.api";
import { getMediaUrl } from "@/utils/media";
import MediaLightbox from "./MediaLightbox";

interface MediaGalleryProps {
  media: PublicMedia[];
  coverPhoto?: string | null;
}

export default function MediaGallery({ media, coverPhoto }: MediaGalleryProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Combine cover photo and media, ensuring no duplicates
  const allMedia = useMemo(() => {
    const combined = [...media];
    const coverUrl = getMediaUrl(coverPhoto);

    if (coverUrl && !combined.some((m) => getMediaUrl(m.file) === coverUrl)) {
      combined.unshift({
        id: 0,
        file: coverPhoto,
        media_type: "image",
        caption: "Cover Photo",
      } as any);
    }
    return combined.sort(
      (a, b) => (a.display_order ?? 999) - (b.display_order ?? 999),
    );
  }, [media, coverPhoto]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  if (allMedia.length === 0) return null;

  return (
    <>
      {/* ✅ RESIZED MAIN VIEWPORT: Constrained height for a professional look */}
      <div
        onClick={() => openLightbox(0)}
        className="relative w-full h-[300px] md:h-[450px] bg-slate-900 rounded-2xl overflow-hidden shadow-lg group cursor-pointer"
      >
        <img
          src={getMediaUrl(allMedia[0].file) || "/placeholder.jpg"}
          alt={allMedia[0].caption || "Property"}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="bg-white/90 text-primary-dark px-4 py-2 rounded-full font-bold text-sm shadow-lg">
            Click to View Gallery
          </span>
        </div>

        {/* Thumbnail count badge */}
        {allMedia.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-black/70 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm flex items-center gap-1">
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
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {allMedia.length} Photos
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allMedia.length > 1 && (
        <div className="grid grid-cols-4 md:grid-cols-6 gap-2 mt-3">
          {allMedia.slice(1, 7).map((item, index) => (
            <button
              key={item.id || index}
              onClick={() => openLightbox(index + 1)}
              className="relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-primary/50 opacity-80 hover:opacity-100 transition-all"
            >
              <img
                src={getMediaUrl(item.file) || ""}
                alt={item.caption || ""}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* ✅ INTEGRATED LIGHTBOX */}
      <MediaLightbox
        media={allMedia}
        currentIndex={lightboxIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onNext={() => setLightboxIndex((prev) => (prev + 1) % allMedia.length)}
        onPrev={() =>
          setLightboxIndex(
            (prev) => (prev - 1 + allMedia.length) % allMedia.length,
          )
        }
      />
    </>
  );
}
