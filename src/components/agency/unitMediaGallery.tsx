"use client";

import React, { useState, useEffect } from "react";
import {
  agencyUnitManagementApi,
  Unit,
  UnitMedia,
} from "@/api/agencyUnitManagement.api";

interface UnitMediaGalleryProps {
  propertyId: number;
  unit: Unit;
  onClose: () => void;
  onMediaChange: () => void;
}

export default function UnitMediaGallery({
  propertyId,
  unit,
  onClose,
  onMediaChange,
}: UnitMediaGalleryProps) {
  const [media, setMedia] = useState<UnitMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMedia();
  }, [propertyId, unit.id]);

  const loadMedia = async () => {
    setLoading(true);
    try {
      const mediaData = await agencyUnitManagementApi.getUnitMedia(
        propertyId,
        unit.id,
      );
      setMedia(mediaData);
    } catch (error) {
      console.error("Failed to load media:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const mediaType: "image" | "video" = file.type.startsWith("video")
      ? "video"
      : "image";

    setUploading(true);
    try {
      await agencyUnitManagementApi.uploadUnitMedia(
        propertyId,
        unit.id,
        file,
        mediaType,
      );
      await loadMedia();
      onMediaChange();
    } catch (error) {
      alert("Failed to upload media.");
    } finally {
      setUploading(false);
    }
  };

  const handleSetPrimary = async (mediaId: number) => {
    try {
      await agencyUnitManagementApi.setPrimaryMedia(propertyId, mediaId);
      await loadMedia();
      onMediaChange();
    } catch (error) {
      alert("Failed to set primary media.");
    }
  };

  const handleDelete = async (mediaId: number) => {
    if (!confirm("Delete this media?")) return;
    try {
      await agencyUnitManagementApi.deleteMedia(propertyId, mediaId);
      await loadMedia();
      onMediaChange();
    } catch (error) {
      alert("Failed to delete media.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-slate-800">
              Media Gallery - {unit.unit_code}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Manage unit cover photos and gallery images
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {/* Upload Section */}
          <div className="mb-6">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 text-slate-400 mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm text-slate-500">
                  Click to upload images or videos
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PNG, JPG, MP4 (Max 10MB)
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>

          {/* Media Grid */}
          {loading ? (
            <div className="text-center py-12 text-slate-400">
              Loading media...
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              No media uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => (
                <div key={item.id} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-slate-100">
                    {item.media_type === "image" ? (
                      <img
                        src={item.url}
                        alt={item.caption}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={item.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>

                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {!item.is_primary && (
                      <button
                        onClick={() => handleSetPrimary(item.id)}
                        className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded hover:bg-primary/90"
                      >
                        Set Cover
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Primary Badge */}
                  {item.is_primary && (
                    <div className="absolute top-2 left-2 px-2 py-1 bg-green-500 text-white text-[10px] font-bold rounded">
                      COVER
                    </div>
                  )}

                  <p className="text-xs text-slate-500 mt-1 truncate">
                    {item.caption || "No caption"}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
