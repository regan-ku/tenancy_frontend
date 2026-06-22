"use client";

import React, { useEffect } from "react";
import { PublicMedia } from "@/api/marketplace.api";
import { getMediaUrl } from "@/utils/media";

interface MediaLightboxProps {
  media: PublicMedia[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function MediaLightbox({
  media,
  currentIndex,
  isOpen,
  onClose,
  onNext,
  onPrev,
}: MediaLightboxProps) {
  // Keyboard navigation support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);

    // Prevent background scrolling when lightbox is open
    if (isOpen) document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !media[currentIndex]) return null;

  const item = media[currentIndex];
  const fileUrl = getMediaUrl(item.file);

  const isExternalVideo =
    item.media_type === "video" &&
    fileUrl &&
    (fileUrl.includes("youtube.com") ||
      fileUrl.includes("youtu.be") ||
      fileUrl.includes("vimeo.com"));

  const handleDownload = () => {
    if (!fileUrl) return;
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = item.caption || `property-media-${item.id}`;
    link.target = "_blank"; // Fallback for external links
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-4 z-50">
        <button
          onClick={handleDownload}
          className="text-white/80 hover:text-secondary transition-colors"
          title="Download Media"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-7 w-7"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
        </button>
        <button
          onClick={onClose}
          className="text-white/80 hover:text-red-500 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* Image Counter */}
      <div className="absolute top-5 left-4 text-white/80 text-sm font-medium z-50">
        {currentIndex + 1} / {media.length}
      </div>

      {/* Navigation Arrows */}
      {media.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/30 hover:bg-black/50 p-3 rounded-full transition-all z-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Media Content */}
      <div className="max-w-6xl max-h-[85vh] w-full h-full flex items-center justify-center">
        {isExternalVideo ? (
          <iframe
            src={fileUrl?.replace("watch?v=", "embed/")}
            className="w-full h-full aspect-video rounded-lg shadow-2xl"
            allowFullScreen
            title="Video"
          />
        ) : item.media_type === "video" ? (
          <video
            src={fileUrl || ""}
            controls
            autoPlay
            className="max-h-full max-w-full rounded-lg shadow-2xl"
          />
        ) : (
          <img
            src={fileUrl || ""}
            alt={item.caption || "Media"}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
        )}
      </div>

      {/* Caption */}
      {item.caption && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-full text-sm backdrop-blur-sm">
          {item.caption}
        </div>
      )}
    </div>
  );
}
