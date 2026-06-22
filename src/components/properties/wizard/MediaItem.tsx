"use client";

import React from "react";
// ✅ FIX: Changed MediaDraft to UploadTask
import { UploadTask } from "@/hooks/useMediaUpload";
import { UnitGroup } from "@/api/properties.api";

interface MediaItemProps {
  draft: UploadTask; // ✅ FIX: Changed MediaDraft to UploadTask
  unitGroups: UnitGroup[];
  onUpdate: (id: string, updates: Partial<UploadTask>) => void;
  onRemove: (id: string) => void;
}

export default function MediaItem({
  draft,
  unitGroups,
  onUpdate,
  onRemove,
}: MediaItemProps) {
  // Generate a temporary preview URL for the file
  const previewUrl = URL.createObjectURL(draft.file);
  const isImage = draft.file.type.startsWith("image/");

  return (
    <div className="flex flex-col md:flex-row gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
      {/* Preview */}
      <div className="w-full md:w-32 h-32 bg-slate-200 rounded-lg overflow-hidden flex-shrink-0">
        {isImage ? (
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-500">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-8 h-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Details Form */}
      <div className="flex-1 space-y-3">
        <div className="flex justify-between items-start">
          <p
            className="text-sm font-medium text-slate-700 truncate max-w-[200px]"
            title={draft.file.name}
          >
            {draft.file.name}
          </p>
          <button
            onClick={() => onRemove(draft.id)}
            className="text-red-500 hover:text-red-700 text-sm font-medium"
          >
            Remove
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Media Type */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
              Media Type
            </label>
            <select
              value={draft.media_type}
              onChange={(e) =>
                onUpdate(draft.id, { media_type: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
            >
              <option value="image">Image / Photo</option>
              <option value="video">Video</option>
              <option value="floor_plan">Floor Plan</option>
              <option value="virtual_tour">Virtual Tour Link</option>
              <option value="document">Document (PDF)</option>
            </select>
          </div>

          {/* Assign to Unit Group (Optional) */}
          {unitGroups.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
                Assign to Unit Group (Optional)
              </label>
              <select
                value={draft.unit_group_id || ""}
                onChange={(e) =>
                  onUpdate(draft.id, {
                    unit_group_id: e.target.value
                      ? Number(e.target.value)
                      : null,
                  })
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none bg-white"
              >
                <option value="">General Property Media</option>
                {unitGroups.map((ug) => (
                  <option key={ug.id} value={ug.id}>
                    {ug.name} ({ug.unit_type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Caption */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">
            Caption / Description
          </label>
          <input
            type="text"
            value={draft.caption}
            onChange={(e) => onUpdate(draft.id, { caption: e.target.value })}
            placeholder="e.g., Spacious living room with natural light"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
          />
        </div>
      </div>
    </div>
  );
}
