"use client";

import React, { useState, useEffect } from "react";
import { usePropertyWizardStore } from "@/store/propertyWizard.store";
import { useMediaUpload, UploadTask } from "@/hooks/useMediaUpload";
import MediaUploadZone from "@/components/properties/wizard/MediaUploadZone";

export default function StepMedia() {
  const { propertyId, formData } = usePropertyWizardStore();
  const { isUploading, progress, results, executeUploads } =
    useMediaUpload(propertyId);

  const [propertyCover, setPropertyCover] = useState<UploadTask[]>([]);
  const [propertyGallery, setPropertyGallery] = useState<UploadTask[]>([]);
  const [unitGroupCovers, setUnitGroupCovers] = useState<
    Record<string, UploadTask[]>
  >({});
  const [unitGroupGalleries, setUnitGroupGalleries] = useState<
    Record<string, UploadTask[]>
  >({});
  const [ownershipDocs, setOwnershipDocs] = useState<UploadTask[]>([]);

  // Initialize empty arrays for each unit group dynamically
  useEffect(() => {
    const initial: Record<string, UploadTask[]> = {};
    formData.unit_groups.forEach((ug) => {
      if (ug.id) {
        initial[ug.id] = [];
      }
    });
    setUnitGroupCovers((prev) => ({ ...initial, ...prev }));
    setUnitGroupGalleries((prev) => ({ ...initial, ...prev }));
  }, [formData.unit_groups]);

  const handleUploadAll = async () => {
    // STRICT VALIDATION: Mandatory fields
    if (propertyCover.length === 0)
      return alert("Property Cover Photo is required.");
    if (ownershipDocs.length === 0)
      return alert(
        "Proof of Ownership documents are MANDATORY before proceeding.",
      );

    const allTasks: UploadTask[] = [
      ...propertyCover.map((t) => ({ ...t, is_cover: true })),
      ...propertyGallery,
      ...Object.entries(unitGroupCovers).flatMap(([ugId, tasks]) =>
        tasks.map((t) => ({
          ...t,
          is_cover: true,
          unit_group_id: Number(ugId),
        })),
      ),
      ...Object.entries(unitGroupGalleries).flatMap(([ugId, tasks]) =>
        tasks.map((t) => ({ ...t, unit_group_id: Number(ugId) })),
      ),
      ...ownershipDocs.map((t) => ({ ...t, media_type: "document" as const })),
    ];

    const success = await executeUploads(allTasks);
    if (success) {
      alert("✅ All media and mandatory documents uploaded successfully!");
    }
  };

  const allSuccess = results.length > 0 && results.every((r) => r.success);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-primary-dark mb-2">
          Media & Ownership Documents
        </h2>
        <p className="text-slate-500">
          Upload property visuals, unit-specific media, and mandatory
          legal/ownership documents.
        </p>
      </div>

      {/* 1. Main Property Media */}
      <section className="space-y-4 p-5 bg-white border border-slate-200 rounded-xl">
        <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
          🏠 Main Property Media
        </h3>
        <MediaUploadZone
          title="Property Cover Photo (Required)"
          description="This will be the main thumbnail on the marketplace."
          accept="image/*"
          tasks={propertyCover}
          onUpdate={setPropertyCover}
        />
        <MediaUploadZone
          title="Property Gallery"
          description="Additional photos, videos, floor plans, and virtual tours."
          tasks={propertyGallery}
          onUpdate={setPropertyGallery}
        />
      </section>

      {/* 2. Dynamic Unit Group Media Sections */}
      {formData.unit_groups.length > 0 && (
        <section className="space-y-6 p-5 bg-white border border-slate-200 rounded-xl">
          <h3 className="text-lg font-bold text-primary-dark flex items-center gap-2">
            🏢 Unit Group Media
          </h3>
          {formData.unit_groups.map((ug) => (
            <div
              key={ug.id}
              className="border-t border-slate-100 pt-4 first:border-t-0 first:pt-0"
            >
              <h4 className="font-semibold text-slate-700 mb-3">
                {ug.name} ({ug.unit_type.replace(/_/g, " ")})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MediaUploadZone
                  title="Unit Group Cover Photo"
                  accept="image/*"
                  tasks={unitGroupCovers[ug.id!] || []}
                  onUpdate={(tasks) =>
                    setUnitGroupCovers((prev) => ({ ...prev, [ug.id!]: tasks }))
                  }
                />
                <MediaUploadZone
                  title="Unit Group Gallery"
                  tasks={unitGroupGalleries[ug.id!] || []}
                  onUpdate={(tasks) =>
                    setUnitGroupGalleries((prev) => ({
                      ...prev,
                      [ug.id!]: tasks,
                    }))
                  }
                />
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3. MANDATORY: Ownership & Legal Documents */}
      <section className="space-y-4 p-5 bg-amber-50 border-2 border-amber-200 rounded-xl">
        <h3 className="text-lg font-bold text-amber-800 flex items-center gap-2">
          📜 Proof of Ownership & Legal Documents (MUST)
        </h3>
        <p className="text-sm text-amber-700">
          Title deeds, land rates, KRA compliance, or business registration
          certificates. Required for marketplace approval.
        </p>
        <MediaUploadZone
          title="Upload Documents"
          accept="application/pdf,image/*"
          tasks={ownershipDocs}
          onUpdate={setOwnershipDocs}
        />
      </section>

      {/* Upload Action & Feedback */}
      <div className="sticky bottom-4 bg-white p-4 rounded-xl shadow-lg border border-slate-200 flex justify-between items-center gap-4">
        <div className="flex-1">
          {isUploading && (
            <div className="w-full bg-slate-200 rounded-full h-2.5">
              <div
                className="bg-secondary h-2.5 rounded-full transition-all"
                style={{
                  width: `${(progress.current / progress.total) * 100}%`,
                }}
              ></div>
            </div>
          )}
          {results.length > 0 && (
            <p
              className={`text-sm font-medium mt-1 ${allSuccess ? "text-green-600" : "text-red-600"}`}
            >
              {allSuccess
                ? "✅ All uploads complete!"
                : `⚠️ ${results.filter((r) => !r.success).length} upload(s) failed.`}
            </p>
          )}
        </div>
        <button
          onClick={handleUploadAll}
          disabled={isUploading}
          className="btn-primary px-8 py-3 disabled:opacity-70 font-semibold"
        >
          {isUploading ? "Processing Uploads..." : "Upload All Media & Docs"}
        </button>
      </div>
    </div>
  );
}
