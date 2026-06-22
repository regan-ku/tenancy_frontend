"use client";

import React, { useState, useEffect } from "react";
import {
  adminMarketplaceApi,
  ListingDeepDive,
  MarketplaceListing,
} from "@/api/adminMarketplace.api";
import { getMediaUrl } from "@/utils/media";

interface ListingReviewPanelProps {
  listing: MarketplaceListing;
  onClose: () => void;
  onUpdate: (id: number, newStatus: string, isFeatured: boolean) => void;
}

export default function ListingReviewPanel({
  listing,
  onClose,
  onUpdate,
}: ListingReviewPanelProps) {
  const [details, setDetails] = useState<ListingDeepDive | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  useEffect(() => {
    adminMarketplaceApi.getListingDeepDive(listing.id).then((data) => {
      setDetails(data);
      setLoading(false);
    });
  }, [listing.id]);

  const handleAction = async (
    action: "feature" | "unfeature" | "hide" | "publish" | "flag",
  ) => {
    if ((action === "hide" || action === "flag") && !actionReason.trim()) {
      return alert(
        "Please provide a reason for hiding or flagging this listing.",
      );
    }

    setIsProcessing(true);
    try {
      await adminMarketplaceApi.moderateListing(
        listing.id,
        action,
        actionReason,
      );

      // Update local state
      let newStatus = listing.status;
      let isFeatured = listing.is_featured;

      if (action === "feature") isFeatured = true;
      if (action === "unfeature") isFeatured = false;
      if (action === "hide" || action === "flag")
        newStatus = action === "flag" ? "flagged" : "hidden";
      if (action === "publish") newStatus = "active";

      onUpdate(listing.id, newStatus, isFeatured);
      alert(`✅ Listing successfully ${action}d.`);
      onClose();
    } catch (error) {
      alert("Failed to execute moderation action.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 p-6 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-primary-dark">
              Listing Moderation
            </h2>
            <p className="text-sm text-slate-500">
              ID: {listing.id} • {listing.owner_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-100 rounded-lg"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
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

        {loading ? (
          <div className="p-12 text-center text-slate-400">
            Loading listing details and media...
          </div>
        ) : details ? (
          <div className="p-6 space-y-6">
            {/* Media Gallery (Admin View) */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase mb-3">
                Property Media ({details.media_files.length} Files)
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {details.media_files.map((media, idx) => (
                  <button
                    key={media.id}
                    onClick={() => setLightboxIndex(idx)}
                    className="aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:ring-2 hover:ring-primary transition-all"
                  >
                    <img
                      src={getMediaUrl(media.url) || ""}
                      alt="Property Media"
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Property Details */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
              <h3 className="font-bold text-slate-800 text-lg">
                {details.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {details.description}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                {details.amenities.map((amenity, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-bold bg-white border border-slate-200 text-slate-600 px-2 py-1 rounded-full"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>

            {/* Ownership & Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Listed By
                </p>
                <p className="font-bold text-slate-800 mt-1">
                  {details.owner_name}
                </p>
                <p className="text-xs text-primary font-medium">
                  {details.owner_email}
                </p>
                <span
                  className={`inline-block mt-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${details.owner_type === "agency" ? "bg-blue-50 text-blue-600" : "bg-green-50 text-green-600"}`}
                >
                  {details.owner_type}
                </span>
              </div>
              <div className="p-4 border border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 uppercase font-bold">
                  Performance
                </p>
                <div className="mt-1 space-y-1 text-sm">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Views:</span>{" "}
                    <span className="font-bold text-slate-800">
                      {details.total_views}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Saves:</span>{" "}
                    <span className="font-bold text-slate-800">
                      {details.total_saves}
                    </span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Inquiries:</span>{" "}
                    <span className="font-bold text-slate-800">
                      {details.total_inquiries}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* Moderation Actions */}
            <div className="border-t border-slate-200 pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-800">
                Moderation Actions
              </h3>

              {(listing.status === "hidden" ||
                listing.status === "flagged") && (
                <div>
                  <label className="block text-xs font-bold text-red-600 uppercase mb-1">
                    Reason for Hiding/Flagging (Required)
                  </label>
                  <textarea
                    rows={2}
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                    placeholder="e.g., Misleading photos, fraudulent pricing..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none resize-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {!listing.is_featured ? (
                  <button
                    onClick={() => handleAction("feature")}
                    disabled={isProcessing}
                    className="py-3 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    ⭐ Feature on Homepage
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction("unfeature")}
                    disabled={isProcessing}
                    className="py-3 bg-slate-200 text-slate-700 font-bold rounded-lg hover:bg-slate-300 disabled:opacity-50"
                  >
                    Remove Featured
                  </button>
                )}

                {listing.status !== "active" ? (
                  <button
                    onClick={() => handleAction("publish")}
                    disabled={isProcessing}
                    className="py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    ✅ Approve & Publish
                  </button>
                ) : (
                  <button
                    onClick={() => handleAction("hide")}
                    disabled={isProcessing || !actionReason.trim()}
                    className="py-3 bg-slate-700 text-white font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                  >
                    🙈 Hide from Public
                  </button>
                )}

                <button
                  onClick={() => handleAction("flag")}
                  disabled={isProcessing || !actionReason.trim()}
                  className="col-span-2 py-3 bg-red-100 text-red-700 font-bold rounded-lg hover:bg-red-200 disabled:opacity-50 border border-red-200"
                >
                  🚩 Flag as Fraudulent / Inappropriate
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Simple Lightbox for Admin Media Review */}
      {lightboxIndex !== -1 && details && (
        <div
          className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightboxIndex(-1)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setLightboxIndex(-1)}
          >
            ✕
          </button>
          <img
            src={getMediaUrl(details.media_files[lightboxIndex].url) || ""}
            alt="Media"
            className="max-h-full max-w-full object-contain"
          />
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex - 1);
              }}
            >
              ‹
            </button>
          )}
          {lightboxIndex < details.media_files.length - 1 && (
            <button
              className="absolute right-4 text-white text-4xl"
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(lightboxIndex + 1);
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
